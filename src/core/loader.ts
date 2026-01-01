import path from "path";
import fs from "fs";

import { client } from "./client.js";
import type { Button, Command } from "../types/index.js";
import { createErrorMessage } from "../utils/embedCreate.js";
import { config } from "../config/config.js";

export class Loaders {
  private readonly featuresPath: string;
  private loadCounts = {
    buttons: 0,
    commands: 0,
    messageCommands: 0,
    events: 0,
    menus: 0,
    modals: 0,
  };

  constructor() {
    this.featuresPath = path.join(__dirname, "..", "feature");
  }

  public async LoadAll(): Promise<void> {
    await this.load("buttons", this.loadButton);
    await this.load("commands", this.loadCommand);
    await this.load("messageCommands", this.loadMessageCommand);
    await this.load("events", this.loadEvent);
    await this.load("menus", this.loadMenu);
    await this.load("modals", this.loadModal);

    console.info(
      `✓ Total loaded: ${this.loadCounts.buttons} buttons, ${this.loadCounts.commands} commands, ` +
        `${this.loadCounts.messageCommands} message commands, ${this.loadCounts.events} events, ` +
        `${this.loadCounts.menus} menus, ${this.loadCounts.modals} modals`,
    );
  }

  private async load(type: string, handler: (p: string) => Promise<number>): Promise<void> {
    const paths = this.getPaths(type);

    if (paths.length === 0) {
      return;
    }

    for (const p of paths) {
      if (fs.existsSync(p)) {
        await this.processDir(p, handler);
      } else {
        console.warn(`Path does not exist: ${p}`);
      }
    }
  }

  private getPaths(type: string): string[] {
    const map: Record<string, string[]> = {
      buttons: this.getFeaturePaths("handlers/buttons"),
      commands: [
        path.join(__dirname, "..", "commands", "slash"),
        ...this.getFeaturePaths("commands/slash"),
      ],
      messageCommands: [
        path.join(__dirname, "..", "commands", "messages"),
        ...this.getFeaturePaths("commands/messages"),
      ],
      events: [path.join(__dirname, "..", "events"), ...this.getFeaturePaths("events")],
      menus: this.getFeaturePaths("handlers/menus"),
      modals: this.getFeaturePaths("handlers/modals"),
    };
    return map[type] || [];
  }

  private getFeaturePaths(subPath: string): string[] {
    if (!fs.existsSync(this.featuresPath)) {
      return [];
    }

    const dirs = fs
      .readdirSync(this.featuresPath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => path.join(this.featuresPath, d.name, subPath))
      .filter((p) => fs.existsSync(p));
    return dirs;
  }

  private async processDir(dir: string, handler: (p: string) => Promise<number>): Promise<number> {
    let count = 0;

    if (!fs.existsSync(dir)) {
      return 0;
    }

    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const p = path.join(dir, item.name);

      if (item.isDirectory()) {
        count += await this.processDir(p, handler);
      } else if (item.name.match(/\.(ts|js)$/)) {
        count += await handler(p);
      }
    }

    return count;
  }

  private async importModule(filePath: string): Promise<any> {
    const absolutePath = path.resolve(filePath);

    const fileUrl =
      process.platform === "win32"
        ? `file:///${absolutePath.replace(/\\/g, "/")}`
        : `file://${absolutePath}`;

    const urlWithCache = `${fileUrl}?update=${Date.now()}`;

    try {
      const imported = await import(urlWithCache);

      if (imported.default !== undefined) {
        if (typeof imported.default === "object" && imported.default.default !== undefined) {
          return imported.default.default;
        }

        return imported.default;
      }

      if (imported.command) return imported.command;
      if (imported.event) return imported.event;
      if (imported.button) return imported.button;
      if (imported.modal) return imported.modal;
      if (imported.menu) return imported.menu;

      return imported;
    } catch (error) {
      console.error(`Failed to import module from ${filePath}:`, error);
      throw error;
    }
  }

  private loadButton = async (p: string): Promise<number> => {
    try {
      if (p.includes("events")) return 0;

      const btn = await this.importModule(p);

      if (!btn || !btn.customId || typeof btn.execute !== "function") {
        console.warn(`Button not loaded from ${p}: missing customId or execute function`);
        return 0;
      }

      const key =
        typeof btn.customId === "function" ? path.relative(this.featuresPath, p) : btn.customId;
      client.buttons.set(key, btn as Button);
      this.loadCounts.buttons++;
      return 1;
    } catch (err) {
      console.error(`Error loading button from ${p}:`, err);
      return 0;
    }
  };

  private loadCommand = async (p: string): Promise<number> => {
    try {
      const cmd = await this.importModule(p);

      if (!cmd || !cmd.data || typeof cmd.execute !== "function") {
        console.warn(`Command not loaded from ${p}: missing data or execute function`);
        return 0;
      }

      client.commands.set(cmd.data.name, cmd as Command);
      this.loadCounts.commands++;
      return 1;
    } catch (err) {
      console.error(`Error loading command from ${p}:`, err);
      return 0;
    }
  };

  private loadMessageCommand = async (p: string): Promise<number> => {
    try {
      const cmd = await this.importModule(p);

      if (!cmd || !cmd.name || !cmd.event || typeof cmd.execute !== "function") {
        console.warn(
          `Message command not loaded from ${p}: ` +
            `missing ${!cmd?.name ? "name" : !cmd?.event ? "event" : "execute"}`,
        );
        return 0;
      }

      client.on(cmd.event, async (msg) => {
        try {
          if (msg.author.bot) return;

          if (
            !msg.content
              .toLowerCase()
              .startsWith(config.prefixTextCommands + cmd.name.toLowerCase())
          ) {
            return;
          }

          if (!msg.guild) {
            await msg.reply("You can only use this command within a server");
            return;
          }

          await cmd.execute(msg);
        } catch (err) {
          console.error(`${cmd.name} execution error:`, err);
          await msg.reply(createErrorMessage());
        }
      });

      this.loadCounts.messageCommands++;
      return 1;
    } catch (err) {
      console.error(`Error loading message command from ${p}:`, err);
      return 0;
    }
  };

  private loadEvent = async (p: string): Promise<number> => {
    try {
      const evt = await this.importModule(p);

      if (!evt || !evt.name || typeof evt.execute !== "function") {
        console.warn(`Event not loaded from ${p}: missing ${!evt?.name ? "name" : "execute"}`);
        return 0;
      }

      if (evt.once) {
        client.once(evt.name, (...args) => evt.execute(...args));
      } else {
        client.on(evt.name, (...args) => evt.execute(...args));
      }

      this.loadCounts.events++;
      return 1;
    } catch (err) {
      console.error(`Error loading event from ${p}:`, err);
      return 0;
    }
  };

  private loadMenu = async (p: string): Promise<number> => {
    try {
      const menu = await this.importModule(p);

      if (!menu || !menu.customId || typeof menu.execute !== "function") {
        console.warn(
          `Menu not loaded from ${p}: missing ${!menu?.customId ? "customId" : "execute"}`,
        );
        return 0;
      }

      const key =
        typeof menu.customId === "function" ? menu.customId.name || "dynamic" : menu.customId;

      client.menus.set(key, menu);
      this.loadCounts.menus++;
      return 1;
    } catch (err) {
      console.error(`Error loading menu from ${p}:`, err);
      return 0;
    }
  };

  private loadModal = async (p: string): Promise<number> => {
    try {
      const modal = await this.importModule(p);

      if (!modal || !modal.customId || typeof modal.execute !== "function") {
        console.warn(
          `Modal not loaded from ${p}: missing ${!modal?.customId ? "customId" : "execute"}`,
        );
        return 0;
      }

      const key = typeof modal.customId === "function" ? modal.customId.toString() : modal.customId;

      client.modals.set(key, modal);
      this.loadCounts.modals++;
      return 1;
    } catch (err) {
      console.error(`Error loading modal from ${p}:`, err);
      return 0;
    }
  };
}

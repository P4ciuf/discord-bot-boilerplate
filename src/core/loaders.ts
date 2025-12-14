import path from "path";
import fs from "fs";
import { client } from "@/core/client";
import * as types from "@/types";
import logger from "@/utils/logger";
import { CONFIG } from "@/config";
import { createErrorEmbed } from "@/utils/createErrorEmbed";

/**
 * Handles loading all bot components from the file system
 */
export class Loaders {
	private readonly featuresPath: string;
	private readonly baseDir: string;
	private loadCounts = {
		buttons: 0,
		commands: 0,
		messageCommands: 0,
		events: 0,
		menus: 0,
		modals: 0,
	};

	constructor() {
		this.baseDir = __dirname;
		this.featuresPath = path.join(this.baseDir, "..", "feature");
	}

	/**
	 * Loads all bot components and logs total counts
	 */
	public async LoadAll(): Promise<void> {
		await this.load("buttons", this.loadButton);
		await this.load("commands", this.loadCommand);
		await this.load("messageCommands", this.loadMessageCommand);
		await this.load("events", this.loadEvent);
		await this.load("menus", this.loadMenu);
		await this.load("modals", this.loadModal);

		logger.info(
			`✓ Total loaded: ${this.loadCounts.buttons} buttons, ${this.loadCounts.commands} commands, ` +
				`${this.loadCounts.messageCommands} message commands, ${this.loadCounts.events} events, ` +
				`${this.loadCounts.menus} menus, ${this.loadCounts.modals} modals`,
		);
	}

	/**
	 * Generic loader that processes all paths for a given component type
	 */
	private async load(type: string, handler: (p: string) => Promise<number>): Promise<void> {
		const paths = this.getPaths(type);

		if (paths.length === 0) {
			return;
		}

		for (const p of paths) {
			if (fs.existsSync(p)) {
				await this.processDir(p, handler);
			} else {
				logger.warn(`Path does not exist: ${p}`);
			}
		}
	}

	/**
	 * Returns all paths to scan for a given component type
	 */
	private getPaths(type: string): string[] {
		const map: Record<string, string[]> = {
			buttons: this.getFeaturePaths("handlers/buttons"),
			commands: [
				path.join(this.baseDir, "commands", "slash"),
				...this.getFeaturePaths("commands/slash"),
			],
			messageCommands: [
				path.join(this.baseDir, "commands", "messages"),
				...this.getFeaturePaths("commands/messages"),
			],
			events: [path.join(this.baseDir, "events"), ...this.getFeaturePaths("events")],
			menus: this.getFeaturePaths("handlers/menus"),
			modals: this.getFeaturePaths("handlers/modals"),
		};
		return map[type] || [];
	}

	/**
	 * Scans feature directories and returns paths that exist
	 */
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

	/**
	 * Recursively processes a directory and loads files using the provided handler
	 */
	private async processDir(
		dir: string,
		handler: (p: string) => Promise<number>,
	): Promise<number> {
		let count = 0;

		if (!fs.existsSync(dir)) {
			return 0;
		}

		const items = fs.readdirSync(dir, { withFileTypes: true });

		for (const item of items) {
			const p = path.join(dir, item.name);

			if (item.isDirectory()) {
				count += await this.processDir(p, handler);
			} else if (item.name.match(/\.(ts|js|cts|cjs)$/)) {
				count += await handler(p);
			}
		}

		return count;
	}

	/**
	 * Loads a button handler and registers it in the client collection
	 */
	private loadButton = async (p: string): Promise<number> => {
		try {
			const module = require(p);
			const btn = module.default as types.Button;

			if (!btn?.customId) {
				logger.warn(`Button not loaded from ${p}: missing customId or invalid structure`);
				return 0;
			}

			// Use relative path as key for dynamic customIds, otherwise use the customId directly
			const key =
				typeof btn.customId === "function"
					? path.relative(this.featuresPath, p)
					: btn.customId;
			client.buttons.set(key, btn);
			this.loadCounts.buttons++;
			return 1;
		} catch (err) {
			logger.error(`Error loading button from ${p}:`, err);
			return 0;
		}
	};

	/**
	 * Loads a slash command and registers it in the client collection
	 */
	private loadCommand = async (p: string): Promise<number> => {
		try {
			const module = require(p);
			const cmd: types.Command = module.default ?? module.command ?? module;

			if (!cmd?.data || typeof cmd.execute !== "function") {
				logger.warn(`Command not loaded from ${p}: missing data or execute function`);
				return 0;
			}

			client.commands.set(cmd.data.name, cmd);
			this.loadCounts.commands++;
			return 1;
		} catch (err) {
			logger.error(`Error loading command from ${p}:`, err);
			return 0;
		}
	};

	/**
	 * Loads a message command and registers its event listener
	 */
	private loadMessageCommand = async (p: string): Promise<number> => {
		try {
			if (p.includes("events")) return 0;
			const module = require(p);
			const cmd: types.MessageCommand = module.default ?? module;

			if (!cmd?.name || !cmd?.event || typeof cmd.execute !== "function") {
				logger.warn(
					`Message command not loaded from ${p}: ` +
						`missing ${!cmd?.name ? "name" : !cmd?.event ? "event" : "execute"}`,
				);
				return 0;
			}

			// Register event listener that checks for prefix + command name
			client.on(cmd.event, async (msg) => {
				try {
					if (msg.author.bot) {
						return;
					}

					if (
						!msg.content
							.toLowerCase()
							.startsWith(CONFIG.messageCommandPrefix + cmd.name.toLowerCase())
					) {
						return;
					}

					if (!msg.guild) {
						return;
					}

					await cmd.execute(msg);
				} catch (err) {
					logger.error(`${cmd.name} execution error:`, err);
					await msg.reply({ embeds: [createErrorEmbed()] });
				}
			});

			this.loadCounts.messageCommands++;
			return 1;
		} catch (err) {
			logger.error(`Error loading message command from ${p}:`, err);
			return 0;
		}
	};

	/**
	 * Loads an event handler and registers it with the client
	 */
	private loadEvent = async (p: string): Promise<number> => {
		try {
			const module = require(p);
			const evt = (module.default as types.Event) ?? (module as types.Event);

			if (!evt?.name || typeof evt.execute !== "function") {
				logger.warn(
					`Event not loaded from ${p}: missing ${!evt?.name ? "name" : "execute"}`,
				);
				return 0;
			}

			try {
				// Register as once or on based on event configuration
				if (evt.once) {
					client.once(evt.name, (...args) => evt.execute(...args));
				} else {
					client.on(evt.name, (...args) => evt.execute(...args));
				}
			} catch (error) {
				logger.error("Error in event: " + evt.name + " Error: " + error);
			}

			this.loadCounts.events++;
			return 1;
		} catch (err) {
			logger.error(`Error loading event from ${p}:`, err);
			return 0;
		}
	};

	/**
	 * Loads a select menu handler and registers it in the client collection
	 */
	private loadMenu = async (p: string): Promise<number> => {
		try {
			const module = require(p);
			const menu = module.default;

			if (!menu?.customId || !menu?.execute) {
				logger.warn(
					`Menu not loaded from ${p}: missing ${!menu?.customId ? "customId" : "execute"}`,
				);
				return 0;
			}

			const key =
				typeof menu.customId === "function"
					? menu.customId.name || "dynamic"
					: menu.customId;

			client.menus.set(key, menu);
			this.loadCounts.menus++;
			return 1;
		} catch (err) {
			logger.error(`Error loading menu from ${p}:`, err);
			return 0;
		}
	};

	/**
	 * Loads a modal handler and registers it in the client collection
	 */
	private loadModal = async (p: string): Promise<number> => {
		try {
			const module = require(p);
			const modal = module.default;

			if (!modal?.customId || !modal?.execute) {
				logger.warn(
					`Modal not loaded from ${p}: missing ${!modal?.customId ? "customId" : "execute"}`,
				);
				return 0;
			}

			const key =
				typeof modal.customId === "function" ? modal.customId.toString() : modal.customId;

			client.modals.set(key, modal);
			this.loadCounts.modals++;
			return 1;
		} catch (err) {
			logger.error(`Error loading modal from ${p}:`, err);
			return 0;
		}
	};
}

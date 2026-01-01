import path from "path";
import fs from "fs";
import { REST, Routes } from "discord.js";

import dotenv from "dotenv";
dotenv.config({ path: [".env", ".env.local"] });

const ENV = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  node_env: process.env.NODE_ENV,
};

async function loadCommandsFromDirectory(dirPath: string, commands: any[]) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await loadCommandsFromDirectory(fullPath, commands);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
      try {
        const commandModule = await import(fullPath);
        const command = commandModule.default ?? commandModule.command ?? commandModule;

        if (command?.data) {
          commands.push(command.data.toJSON());
          console.info(`✓ Loaded command: ${command.data.name}`);
        }
      } catch (error) {
        console.error(`✗ Failed to load command at ${fullPath}:`);
        if (error instanceof Error) {
          console.error(`  Message: ${error.message}`);
        }
      }
    }
  }
}

async function registerCommands() {
  const token = ENV.token;
  const clientId = ENV.clientId;

  if (!token || !clientId) {
    console.error("Missing DISCORD_TOKEN or CLIENT_ID in environment variables");
    process.exit(1);
  }

  const commands: any[] = [];

  const mainCommandsPath = path.join(__dirname, "..", "src", "commands", "slash");
  await loadCommandsFromDirectory(mainCommandsPath, commands);

  const featuresPath = path.join(__dirname, "..", "src", "feature");
  if (fs.existsSync(featuresPath)) {
    const featureFolders = fs.readdirSync(featuresPath, { withFileTypes: true });

    for (const featureFolder of featureFolders) {
      if (featureFolder.isDirectory()) {
        const featureCommandsPath = path.join(
          featuresPath,
          featureFolder.name,
          "commands",
          "slash",
        );
        await loadCommandsFromDirectory(featureCommandsPath, commands);
      }
    }
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.info(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.info(`✓ Successfully registered ${(data as any[]).length} commands`);
  } catch (error) {
    console.error("Failed to register commands:");
    if (error instanceof Error) {
      console.error(`  Message: ${error.message}`);
      console.error(`  Stack: ${error.stack}`);
    }
    process.exit(1);
  }
}

registerCommands();

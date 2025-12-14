import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { REST, Routes } from "discord.js";
import { ENV } from "@/config/env";
import logger from "@/utils/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively loads command files from a directory
 * @param dirPath - Directory path to scan
 * @param commands - Array to collect command data
 */
async function loadCommandsFromDirectory(dirPath: string, commands: any[]) {
	if (!fs.existsSync(dirPath)) {
		return;
	}

	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		if (entry.isDirectory()) {
			await loadCommandsFromDirectory(fullPath, commands);
		} else if (entry.isFile() && entry.name.endsWith(".ts")) {
			try {
				// Build TypeScript file with Bun to enable dynamic imports
				const result = await Bun.build({
					entrypoints: [fullPath],
					target: "bun",
					format: "esm",
					external: ["discord.js", "mongoose", "winston", "*"],
				});

				if (!result.success) {
					throw new Error(`Build failed: ${result.logs.join("\n")}`);
				}

				const output = result.outputs[0];
				if (!output) {
					throw new Error(`No output generated for ${fullPath}`);
				}

				// Convert built code to data URL for import
				const code = await output.text();
				const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
				const commandModule = await import(dataUrl);
				const command = commandModule.default ?? commandModule.command ?? commandModule;

				if (command?.data) {
					commands.push(command.data.toJSON());
					logger.info(`✓ Loaded command: ${command.data.name}`);
				}
			} catch (error) {
				logger.error(`✗ Failed to load command at ${fullPath}:`);
				if (error instanceof Error) {
					logger.error(`  Message: ${error.message}`);
				}
			}
		}
	}
}

/**
 * Registers all slash commands with Discord API
 */
async function registerCommands() {
	const token = ENV.token;
	const clientId = ENV.clientId;

	if (!token || !clientId) {
		logger.error("Missing DISCORD_TOKEN or CLIENT_ID in environment variables");
		process.exit(1);
	}

	const commands: any[] = [];

	// Load commands from the slash commands directory
	const mainCommandsPath = path.join(__dirname, "..", "src", "commands", "slash");
	await loadCommandsFromDirectory(mainCommandsPath, commands);

	const rest = new REST({ version: "10" }).setToken(token);

	try {
		logger.info(`Started refreshing ${commands.length} application (/) commands.`);

		// Register commands globally for the application
		const data = await rest.put(Routes.applicationCommands(clientId), {
			body: commands,
		});

		logger.info(`✓ Successfully registered ${(data as any[]).length} commands`);
	} catch (error) {
		logger.error("Failed to register commands:");
		if (error instanceof Error) {
			logger.error(`  Message: ${error.message}`);
			logger.error(`  Stack: ${error.stack}`);
		}
		process.exit(1);
	}
}

registerCommands();

import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} from "discord.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Command } from "./types/Command";
import { Event } from "./types/Event";
import logger from "./utils/logger";

dotenv.config({ path: [".env.local", ".env"] });

const dbUri = process.env.MONGODB_URI!;
let isConnected = false;

function checkMongoStatus(): string {
  return mongoose.connection.readyState === 1 ? "connected" : "disconnected";
}

async function connectDB() {
  try {
    if (checkMongoStatus() === "connected") return;

    await mongoose.connect(dbUri);

    isConnected = true;

    mongoose.connection.on("error", (err: any) => {
      logger.error("MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      logger.info("MongoDB disconnected");
      isConnected = false;
    });
  } catch (err: any) {
    isConnected = false;
    logger.error("Error connecting to database:", err);
    throw err;
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  failIfNotExists: false,
}) as any;

client.commands = new Collection<string, Command>();

// --- COMMANDS ---

const commands: any[] = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
let registeredCommands = 0;
let failedCommands = 0;

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: string) => file.endsWith(".ts"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const relativePath = path.relative(__dirname, filePath);

    try {
      const imported = require(filePath);
      const command: Command = imported.default ?? imported;

      if (!command || typeof command !== "object") {
        logger.warn(
          `Command at ${relativePath} does not export a valid object - skipped`
        );
        failedCommands++;
        continue;
      }

      if (!command.data) {
        logger.warn(
          `Command at ${relativePath} is missing "data" property - skipped`
        );
        failedCommands++;
        continue;
      }

      if (!command.execute || typeof command.execute !== "function") {
        logger.warn(
          `Command at ${relativePath} is missing valid "execute" function - skipped`
        );
        failedCommands++;
        continue;
      }

      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
      logger.info(
        `✅ Command '${command.data.name}' loaded from ${relativePath}`
      );
      registeredCommands++;
    } catch (error: any) {
      logger.error(
        `❌ Failed to load command from ${relativePath}: ${error.message}`
      );
      if (error.stack) {
        logger.error(`   Stack: ${error.stack.split("\n")[1]?.trim()}`);
      }
      failedCommands++;
    }
  }
}

logger.info(
  `Commands: ${registeredCommands} registered, ${failedCommands} failed`
);

console.log("");

// --- EVENTS ---

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

let registeredEvents = 0;
let failedEvents = 0;

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const relativePath = path.relative(__dirname, filePath);

  try {
    const eventModule = require(filePath);
    const event: Event = eventModule.default ?? eventModule;

    if (!event || typeof event !== "object") {
      logger.warn(
        `Event at ${relativePath} does not export a valid object - skipped`
      );
      failedEvents++;
      continue;
    }

    if (!event.name) {
      logger.warn(
        `Event at ${relativePath} is missing "name" property - skipped`
      );
      failedEvents++;
      continue;
    }

    if (!event.execute || typeof event.execute !== "function") {
      logger.warn(
        `Event at ${relativePath} is missing valid "execute" function - skipped`
      );
      failedEvents++;
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args: any) => event.execute(...args));
    } else {
      client.on(event.name, (...args: any) => event.execute(...args));
    }

    logger.info(`✅ Event '${event.name}' loaded from ${relativePath}`);
    registeredEvents++;
  } catch (error: any) {
    logger.error(
      `❌ Failed to load event from ${relativePath}: ${error.message}`
    );
    if (error.stack) {
      logger.error(`   Stack: ${error.stack.split("\n")[1]?.trim()}`);
    }
    failedEvents++;
  }
}


logger.info(`Events: ${registeredEvents} registered, ${failedEvents} failed`);

console.log("");

// Initialization
async function initialize() {
  try {
    logger.info("Initializing bot application...");

    await connectDB();
    logger.info("MongoDB connected successfully");

    const rest = new REST().setToken(process.env.TOKEN!);

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    });

    await client.login(process.env.TOKEN!);
    
    logger.info("🚀 Application initialized successfully!");
  } catch (error: any) {
    logger.error("Failed to initialize application:", error);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  try {
    client.destroy();
    logger.info("Discord client destroyed");

    if (isConnected) {
      await mongoose.connection.close();
      isConnected = false;
      logger.info("MongoDB connection closed");
    }

    process.exit(0);
  } catch (error: any) {
    logger.error("Error during shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (error: any) => {
  logger.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error: any) => {
  logger.error("Uncaught exception:", error);
  process.exit(1);
});

initialize();

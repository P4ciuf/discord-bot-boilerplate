import { ENV } from "./config/env";
import { connectDb } from "./database";
import { shutdown } from "./shutdown";
import { client } from "./core/client";
import { Loaders } from "./core/loaders";
import logger from "./utils/logger";

/**
 * Initializes the bot by loading components, logging in, and connecting to database
 */
async function init() {
	try {
		// Verify Discord token exists
		if (!ENV.TOKEN) {
			return logger.error("Token not found");
		}

		// Load all bot components (commands, events, handlers)
		await new Loaders().LoadAll();

		// Login to Discord
		await client.login(ENV.TOKEN);
		logger.info("Client logged in as: " + client.user?.username);

		// Connect to MongoDB
		await connectDb();
	} catch (err) {
		logger.error("Bot initialization error: " + err);
	}
}

// Handle graceful shutdown signals
process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
	logger.error("Unhandled promise rejection:", error);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
	logger.error("Uncaught exception:", error);
	shutdown();
});

// Start the bot
(async () => {
	await init();
})();

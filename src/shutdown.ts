import mongoose from "mongoose";
import { client } from "./core/client";
import logger from "./utils/logger";

/**
 * Gracefully shuts down the bot by disconnecting client and database
 */
export async function shutdown() {
	try {
		// Disconnect Discord client
		await client.destroy();
		logger.info("Client successfully destroyed");

		// Disconnect from MongoDB
		await mongoose.disconnect();
		logger.info("MongoDb successfully disconnected");
	} catch (err) {
		logger.error("Bot shutdown error: " + err);
	}
}

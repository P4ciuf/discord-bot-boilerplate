import { ENV } from "@/config/env";
import logger from "@/utils/logger";
import mongoose from "mongoose";

/**
 * Establishes connection to MongoDB database
 */
export async function connectDb() {
	try {
		if (!ENV.MONGODB_URI) {
			return logger.error("DbUri not found");
		}

		await mongoose.connect(ENV.MONGODB_URI);
		logger.info("DB connected successfully");
	} catch (err) {
		logger.error("Database connection error: " + err);
	}
}

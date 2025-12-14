import { ENV } from "@/config/env";
import logger from "@/utils/logger";
import { REST, Routes } from "discord.js";

// Check if required environment variables are present
if (ENV.token && ENV.clientId) {
	const rest = new REST().setToken(ENV.token);

	// Delete all registered application commands by sending an empty array
	rest.put(Routes.applicationCommands(ENV.clientId), { body: [] })
		.then(() => logger.info("Successfully deleted all application commands."))
		.catch(logger.error);
}

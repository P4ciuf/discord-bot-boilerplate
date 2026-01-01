import logger from "@techtribe-studio/logger";
import { ENV } from "./config/env.js";
import { Loaders } from "./core/loader";
import { client } from "./core/client";
import { shutdown } from "./shutdown";

(async () => {
  try {
    // controllo esistenza token
    if (!ENV.token) {
      return logger.error("Token not found");
    }

    await new Loaders().LoadAll();

    // connessione client
    await client.login(ENV.token);
    logger.info("Client logged in as: " + client.user?.username);
  } catch (err) {
    logger.error("Bot initialization error: " + err);
  }
})();

process.on("SIGINT", async () => {
  logger.info("SIGINT");
  await shutdown();
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM");
  await shutdown();
});

import { REST, Routes } from "discord.js";

const ENV = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
};

(async () => {
  if (ENV.token && ENV.clientId) {
    const rest = new REST().setToken(ENV.token);

    const commands = (await rest.get(Routes.applicationCommands(ENV.clientId))) as {
      id: string;
      name: string;
    }[];

    for (const command of commands) {
      await rest.delete(Routes.applicationCommand(ENV.clientId, command.id));
      console.log(`Deleted command: ${command.name}`);
    }

    console.log("✅ All commands deleted");
  }
})();

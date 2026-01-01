import { ActivityType, Client, Events } from "discord.js";
import { Event } from "../../types";
import { createInfoEmbeds } from "../../feature/createInfoMessages/services/InfoEmbedService";
import { createApplyPanel } from "../../feature/application/services/createPanel";
import { selfAdvJobs } from "../../feature/selfAdvSystem/jobs/deleteMessage";

export default {
  name: Events.ClientReady,
  async execute(...args: any) {
    const client = args[0] as Client;
    client.user?.setActivity({
      type: ActivityType.Watching,
      name: "🌐 • Techtribe Studio",
    });

    setTimeout(async () => {
      await createInfoEmbeds();
      await createApplyPanel();
      await selfAdvJobs.start();
    }, 10000);
  },
} as Event;

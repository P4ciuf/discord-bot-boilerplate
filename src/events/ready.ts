import { Client, ActivityType } from "discord.js";
import { Event } from "./../types/Event";

const readyEvent: Event = {
  name: "clientReady",
  once: true,
  execute(client: Client) {
    client.user?.setActivity("Made by P4ciuf", {
      type: ActivityType.Playing,
    });
  },
};

export default readyEvent;

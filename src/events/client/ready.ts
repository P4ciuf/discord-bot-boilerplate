import { Event } from "@/types";
import { ActivityType, Client, Events } from "discord.js";

export default {
	name: Events.ClientReady,
	async execute(...args) {
		const client = args[0] as Client;
		// Set bot's activity status when ready
		client.user?.setActivity({
			type: ActivityType.Watching,
			name: `Made by P4ciuf`,
		});
	},
} as Event;

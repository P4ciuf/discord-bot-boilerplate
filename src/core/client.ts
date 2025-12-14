import { Client, Collection, GatewayIntentBits } from "discord.js";
import * as type from "../types";

// Extend Discord Client with custom collections for interactions
interface ExtendedClient extends Client {
	commands: Collection<string, type.Command>;
	buttons: Collection<string, type.Button>;
	modals: Collection<string, type.Modal>;
	menus: Collection<string, type.Menu>;
}

// Initialize Discord client with required intents
export const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
}) as ExtendedClient;

// Initialize collections for storing interaction handlers
client.buttons = new Collection<string, type.Button>();
client.commands = new Collection<string, type.Command>();
client.modals = new Collection<string, type.Modal>();
client.menus = new Collection<string, type.Menu>();

import {
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
	type SlashCommandSubcommandsOnlyBuilder,
	ChatInputCommandInteraction,
} from "discord.js";

export interface Command {
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
	execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

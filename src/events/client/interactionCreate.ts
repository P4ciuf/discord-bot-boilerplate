import { Events, type Interaction } from "discord.js";
import { client } from "@/core/client";
import { Event, Modal } from "@/types";
import logger from "@/utils/logger";
import { createErrorEmbed } from "@/utils/createErrorEmbed";

export default {
	name: Events.InteractionCreate,
	async execute(...args: unknown[]) {
		const interaction = args[0] as Interaction;

		try {
			// Handle button interactions
			if (interaction.isButton()) {
				const button = Array.from(client.buttons.values()).find((btn) => {
					if (typeof btn.customId === "function") {
						return (btn.customId as (id: string) => boolean)(interaction.customId);
					}
					return btn.customId === interaction.customId;
				});

				if (!button) {
					logger.warn(`Button ${interaction.customId} not found`);
					return;
				}

				await button.execute(interaction);
			}

			// Handle slash command interactions
			if (interaction.isChatInputCommand()) {
				const command = client.commands.get(interaction.commandName);
				if (!command) {
					logger.warn(`Command ${interaction.commandName} not found`);
					return;
				}
				await command.execute(interaction);
			}

			// Handle modal submit interactions
			if (interaction.isModalSubmit()) {
				let modal: Modal | null = null;

				for (const mdl of client.modals.values()) {
					if (typeof mdl.customId === "function") {
						if (
							(mdl.customId as (id: string) => boolean)(interaction.customId) === true
						) {
							modal = mdl;
							break;
						}
					} else if (mdl.customId === interaction.customId) {
						modal = mdl;
						break;
					}
				}

				if (!modal) {
					logger.warn(`Modal ${interaction.customId} not found`);
					return;
				}
				await modal.execute(interaction);
			}

			// Handle select menu interactions
			if (interaction.isStringSelectMenu()) {
				const menu = Array.from(client.menus.values()).find((mnu) => {
					if (typeof mnu.customId === "function") {
						return (mnu.customId as (id: string) => boolean)(interaction.customId);
					}
					return mnu.customId === interaction.customId;
				});

				if (!menu) {
					logger.warn(`Menu ${interaction.customId} not found`);
					return;
				}
				await menu.execute(interaction);
			}
		} catch (e) {
			// Handle errors and send error embed to user
			try {
				logger.error(`Error in interaction ${interaction.id}: ` + e);
				if (interaction.isRepliable() && !interaction.replied) {
					if (interaction.deferred) {
						await interaction.editReply({ embeds: [createErrorEmbed()] });
						return;
					}
					await interaction.reply({ embeds: [createErrorEmbed()], flags: 64 }); // MessageFlags.Ephemeral
				}
			} catch (err) {
				logger.error(`Error in error response to interaction ${interaction.id} ` + err);
			}
		}
	},
} as Event;

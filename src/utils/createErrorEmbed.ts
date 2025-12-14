import { client } from "@/core/client";
import { EmbedBuilder } from "discord.js";

/**
 * Creates a standardized error embed for Discord interactions
 * @param err - Error message to display (defaults to generic error message)
 * @returns EmbedBuilder configured with error styling
 */
export function createErrorEmbed(
	err: string | undefined = "An error occurred during the interaction",
): EmbedBuilder {
	return new EmbedBuilder()
		.setTitle("❌ An error occurred")
		.setDescription(`\`\`\`${err}\`\`\``)
		.setColor("Red")
		.setFooter({
			text: "Please try again or report the bag to the bot admin",
			iconURL: client.user?.displayAvatarURL({ extension: "webp" }),
		});
}

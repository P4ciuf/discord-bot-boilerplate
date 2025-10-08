import { Client, EmbedBuilder } from "discord.js";

export default function createErrorEmbed(client: Client, error: any) {
  return new EmbedBuilder()
    .setTitle("❌ An error occurred")
    .setDescription(`\`\`\`${error}\`\`\``)
    .setFooter({
      text: "Please try again in a few minutes or contact an administrator.",
      iconURL: client.user?.displayAvatarURL({ extension: "webp" }),
    });
}

import { AttachmentBuilder, ButtonStyle, EmbedBuilder, MessageFlags, User } from "discord.js";
import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { join } from "path";
import logger from "@techtribe-studio/logger";
import { client } from "../core/client";

const ERROR_ATTACHMENT_PATH = join(__dirname, "..", "assets", "icons", "errorIcon.webp");
const SUCCESS_ATTACHMENT_PATH = join(__dirname, "..", "assets", "icons", "successIcon.webp");

function createErrorEmbed(error: string): EmbedBuilder {
  try {
    return new EmbedBuilder()
      .setTitle("❌ An error occurred")
      .setDescription(`\`\`\`${error}\`\`\``)
      .setColor("Red")
      .setThumbnail("attachment://error-icon.webp")
      .setFooter({
        text: "Please try again or report the error to the support server.",
        iconURL: client.user?.displayAvatarURL({ extension: "webp" }),
      });
  } catch (err) {
    logger.error(`Error creating embed: ${err}`);
    return new EmbedBuilder()
      .setTitle("❌ An error occurred")
      .setDescription("An unexpected error occurred. Please try again.")
      .setColor("Red");
  }
}

function createErrorButtons(): ActionRowBuilder<ButtonBuilder> | null {
  try {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("💬 Support server")
        .setURL("https://discord.gg/Z4cjcrGX8K")
        .setStyle(ButtonStyle.Link),
    );
  } catch (err) {
    logger.error(`Error creating buttons: ${err}`);
    return null;
  }
}

function createErrorAttachment(): AttachmentBuilder | null {
  try {
    return new AttachmentBuilder(ERROR_ATTACHMENT_PATH, {
      name: "error-icon.webp",
    });
  } catch (err) {
    logger.error(`Error creating attachment: ${err}`);
    return null;
  }
}

function createSuccessAttachment(): AttachmentBuilder | null {
  return new AttachmentBuilder(SUCCESS_ATTACHMENT_PATH, {
    name: "success-icon.webp",
  });
}

export function createEphemeralErrorMessage(
  error: string = "An error occurred during the interaction",
) {
  const embed = createErrorEmbed(error);
  const buttons = createErrorButtons();
  const attachment = createErrorAttachment();

  const result: {
    embeds: EmbedBuilder[];
    components: ActionRowBuilder<ButtonBuilder>[];
    files: AttachmentBuilder[];
    flags: MessageFlags.Ephemeral;
  } = {
    embeds: [],
    components: [],
    files: [],
    flags: MessageFlags.Ephemeral,
  };

  if (embed) result.embeds.push(embed);
  if (buttons) result.components.push(buttons);
  if (attachment) result.files.push(attachment);

  return result;
}

export function createErrorMessage(error: string = "An error occurred during the interaction") {
  const embed = createErrorEmbed(error);
  const buttons = createErrorButtons();
  const attachment = createErrorAttachment();

  const result: {
    embeds: EmbedBuilder[];
    components: ActionRowBuilder<ButtonBuilder>[];
    files: AttachmentBuilder[];
  } = {
    embeds: [],
    components: [],
    files: [],
  };

  if (embed) result.embeds.push(embed);
  if (buttons) result.components.push(buttons);
  if (attachment) result.files.push(attachment);

  return result;
}

export function createSuccessEmbed(operation: string, description: string) {
  const embed = new EmbedBuilder()
    .setTitle(
      `:white_check_mark: ${
        operation.charAt(0).toUpperCase() + operation.slice(1).toLowerCase()
      } executed successfully`,
    )
    .setThumbnail("attachment://success-icon.webp")
    .setColor("DarkGreen")
    .setDescription(description);
  const attachment = createSuccessAttachment();

  const result: {
    embeds: EmbedBuilder[];
    files: AttachmentBuilder[];
  } = {
    embeds: [],
    files: [],
  };

  if (embed) result.embeds.push(embed);
  if (attachment) result.files.push(attachment);

  return result;
}

export function createDmNotification(
  title: string,
  user: User,
  moderator: User,
  description?: string | null,
) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setColor("DarkBlue")
    .setDescription(
      `User: ${user}\n` +
        `User ID: \`${user.id}\`\n` +
        `Admin: ${moderator}` +
        `${"\n" + description || ""}`,
    );

  const result: {
    embeds: EmbedBuilder[];
  } = {
    embeds: [],
  };

  if (embed) result.embeds.push(embed);

  return result;
}

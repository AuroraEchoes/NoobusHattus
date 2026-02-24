import { EmbedBuilder } from "discord.js";

export const successEmbed = new EmbedBuilder().setColor(0x42a426);
export const failureEmbed = new EmbedBuilder().setColor(0xaf1d2c);

export const couldNotAssignRoleEmbed = failureEmbed
  .setTitle("Could not assign roles")
  .setDescription("Check that the bot has the Manage Roles permission")

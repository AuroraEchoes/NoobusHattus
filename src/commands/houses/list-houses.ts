import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { HouseModel, Houses } from '../../db/houses.js';
import { successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';

export default {
  data: {
    name: "list-houses",
    description: "Lists all houses in this server",
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;

    const guildId = BigInt(interaction.guildId!)
    const houses = await Houses.getByGuild(guildId)

    if (houses.length === 0) {
      await interaction.reply({ embeds: [embedNoHouses()], flags: MessageFlags.Ephemeral })
      return
    }

    await interaction.reply({ embeds: [embed(houses)], flags: MessageFlags.Ephemeral })
  },
} satisfies Command;

function embed(houses: HouseModel[]): EmbedBuilder {
  return successEmbed
    .setTitle("House List")
    .setDescription(houses.map((house, _) => `**${house.house_emoji} ${house.house_name}**: ID: \`${house.id}\`, Season ID: \`${house.season_id}\``).join("\n"))
    .setFields([])
}

function embedNoHouses(): EmbedBuilder {
  return successEmbed
    .setTitle("There are no houses")
    .setDescription("Create a house using `/create-house")
    .setFields([])
}

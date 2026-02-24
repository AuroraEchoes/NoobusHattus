import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from '../index.js';
import { HouseModel, Houses } from '../../db/houses.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { successEmbed } from '../../lib/embeds.js';

export default {
  data: {
    name: "create-house",
    description: "Create a new season",
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "season-id",
        description: "Season ID to create the house within",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "house-name",
        description: "House name",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "house-emoji",
        description: "House emoji (or prefix)",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Role,
        name: "house-role",
        description: "Role to automatically apply to all house members",
        required: false
      }
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const seasonId = interaction.options.getInteger("season-id")!
    const houseName = interaction.options.getString("house-name")!
    const houseEmoji = interaction.options.getString("house-emoji")!
    const houseRoleOpt = interaction.options.getRole("house-role")?.id
    const houseRole = houseRoleOpt ? BigInt(houseRoleOpt) : undefined
    const house = await Houses.create(seasonId, houseName, houseEmoji, houseRole)
    await interaction.reply({ embeds: [embed(house)], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embed(house: HouseModel): EmbedBuilder {
  return successEmbed
    .setTitle("House Successfully Created")
    .setFields([
      { name: "House Name", value: `\`${house.house_name}\``, inline: true },
      { name: "House ID", value: `\`${house.id}\``, inline: true }
    ])
}

import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from '../index.js';
import { HouseModel, Houses } from '../../db/houses.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { couldNotAssignRoleEmbed, failureEmbed, successEmbed } from '../../lib/embeds.js';
import { Seasons } from '../../db/seasons.js';
import { Users } from '../../db/users.js';
import { hasAssignRolePermission, userAddRole } from './house-utils.js';

export default {
  data: {
    name: "house-add-role",
    description: "Give an entire house an arbitrary role (e.g. for winning the house cup)",
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "house-id",
        description: "House ID",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Role,
        name: "role",
        description: "Role to apply to all house members",
        required: true
      }
    ]
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;
    if (!hasAssignRolePermission(BigInt(interaction.guildId!))) {
      await interaction.reply({ embeds: [couldNotAssignRoleEmbed], flags: MessageFlags.Ephemeral });
      return
    }

    const houseId = interaction.options.getInteger("house-id")!
    const role = interaction.options.getRole("role")!
    const guildId = BigInt(interaction.guildId!)

    const house = await Houses.getById(houseId)
    if (house === undefined) {
      await interaction.reply({ embeds: [houseNotFound(houseId)], flags: MessageFlags.Ephemeral });
      return
    }

    const houseExistsInServer = await Seasons.existsInServer(house.season_id!, guildId)
    if (!houseExistsInServer) {
      await interaction.reply({ embeds: [houseNotInServer(houseId)], flags: MessageFlags.Ephemeral });
      return
    }

    const usersInHouse = await Users.getByHouse(house.id)
    for (const user of usersInHouse) {
      userAddRole(guildId, user.discord_id, BigInt(role.id))
    }

    await interaction.reply({ embeds: [embed(house)], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embed(house: HouseModel): EmbedBuilder {
  return successEmbed
    .setTitle("Role Successfully Assigned")
    .setFields([
      { name: "House Name", value: `\`${house.house_name}\``, inline: true },
      { name: "House ID", value: `\`${house.id}\``, inline: true }
    ])
}

function houseNotFound(houseId: number): EmbedBuilder {
  return failureEmbed
    .setTitle("House does not exist")
    .setDescription(`House ${houseId} does not exist`)
    .setFields([])
}

function houseNotInServer(houseId: number): EmbedBuilder {
  return failureEmbed
    .setTitle("House is in another server")
    .setDescription(`House ${houseId} is in another server`)
    .setFields([])
}

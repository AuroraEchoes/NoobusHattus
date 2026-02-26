import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from '../index.js';
import { HouseModel, Houses } from '../../db/houses.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { Seasons } from '../../db/seasons.js';
import { UserModel, Users } from '../../db/users.js';

export default {
  data: {
    name: "house-list-players",
    description: "List all players in a house",
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "house-id",
        description: "House ID",
        required: true,
      },
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;

    const houseId = interaction.options.getInteger("house-id")!
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

    await interaction.reply({ embeds: [embed(house, usersInHouse)], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embed(house: HouseModel, users: UserModel[]): EmbedBuilder {
  let description = users.map((u, _) => `<@${u.discord_id}>`).join(",")
  if (description.length === 0) {
    description = "*House is empty*"
  }
  return successEmbed
    .setTitle(`${house.house_emoji} ${house.house_name} member list`)
    .setDescription(description)
    .setFields([])
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

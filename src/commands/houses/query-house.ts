import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { HouseModel, Houses } from '../../db/houses.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } from 'discord.js';
import { Users } from '../../db/users.js';
import { SeasonModel, Seasons } from '../../db/seasons.js';

export default {
  data: {
    name: "query-house",
    description: "Query the house of a user for the active season",
    options: [{
      name: "user",
      type: ApplicationCommandOptionType.User,
      description: "User to query the house of",
      required: true
    }
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.USE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const target = BigInt(interaction.options.getUser("user")!.id)
    const guildId = BigInt(interaction.guildId!)
    const activeSeason = await Seasons.getActive(guildId)
    if (activeSeason === undefined) {
      await interaction.reply({ embeds: [embedNoActiveSeasons(target)], flags: MessageFlags.Ephemeral })
      return
    }
    const user = await Users.getByDiscordId(target)
    if (user === undefined) {
      await interaction.reply({ embeds: [embedUserDoesNotExist(target)], flags: MessageFlags.Ephemeral })
      return
    }

    const playerHouse = await Houses.getByUserBySeason(user.id, activeSeason.id)
    if (playerHouse === undefined) {
      await interaction.reply({ embeds: [embedNotInHouse(target, activeSeason)], flags: MessageFlags.Ephemeral })
      return
    }
    await interaction.reply({ embeds: [embed(target, playerHouse, activeSeason)], flags: MessageFlags.Ephemeral })
  },
} satisfies Command;

function embed(targetDiscordId: BigInt, house: HouseModel, season: SeasonModel): EmbedBuilder {
  return successEmbed
    .setTitle(`User is in **${house.house_emoji} ${house.house_name}**`)
    .setDescription(`@<${targetDiscordId}> is in **${house.house_emoji} ${house.house_name}** for ${season.season_name}`)
    .setFields([])
}

function embedNoActiveSeasons(targetDiscordId: BigInt): EmbedBuilder {
  return failureEmbed
    .setTitle("No active season")
    .setDescription(`@<${targetDiscordId}> is not in a house as there are no active seasons`)
    .setFields([])
}

function embedNotInHouse(targetDiscordId: BigInt, season: SeasonModel): EmbedBuilder {
  return failureEmbed
    .setTitle("Not in a house")
    .setDescription(`@<${targetDiscordId}> is not in a house for ${season.season_name}`)
    .setFields([])
}

function embedUserDoesNotExist(targetDiscordId: BigInt): EmbedBuilder {
  return failureEmbed
    .setTitle("User not registered")
    .setDescription(`@<${targetDiscordId}> is not registered with the bot.`)
    .setFields([])
}

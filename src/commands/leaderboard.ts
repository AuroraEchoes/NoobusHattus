import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from './index.js';
import { Permission, PermissionManager } from '../permissions.js';
import { failureEmbed, successEmbed } from '../lib/embeds.js';
import { PointActions } from "../db/point-actions.js";
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { Seasons } from '../db/seasons.js';
import { Houses } from '../db/houses.js';
import { Users } from '../db/users.js';

export default {
  data: {
    name: "leaderboard",
    description: "View the current season’s leaderboard",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "individual",
        description: "View the individual leaderboard",
        required: false
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "house",
        description: "View the house leaderboard",
        required: false
      },

    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.USE_BOT)) return
    if (!interaction.isChatInputCommand()) return;

    const guildId = BigInt(interaction.guildId!)
    const season = await Seasons.getActive(guildId)
    if (season === undefined) {
      await interaction.reply({ embeds: [embedNoActiveSeasons()], flags: MessageFlags.Ephemeral })
      return
    }

    const subcommand = interaction.options.getSubcommand(false)
    if (subcommand === "house" || subcommand === null) {
      await interaction.reply({ embeds: [await embedHouseLeaderboard(season.id)], flags: MessageFlags.Ephemeral })
    } else {
      await interaction.reply({ embeds: [await embedHouseIndividual(season.id)], flags: MessageFlags.Ephemeral })
    }
  },
} satisfies Command;

async function embedHouseLeaderboard(seasonId: number): Promise<EmbedBuilder> {
  const points = await PointActions.getPointTotalsBySeason(seasonId)
  const sortedPoints = points.sort((a, b) => a.points! - b.points!)
  const houses = await Houses.getBySeason(seasonId)
  let description = sortedPoints.map((x, idx) => {
    const house = houses.find(h => h.id === x.house_id)
    return `**#${idx + 1}**: ${house?.house_emoji} ${house?.house_name} (${x.points} points)`
  }).join("\n")
  if (description.length === 0) {
    description = "*No points awarded*"
  }
  return successEmbed
    .setTitle("House Leaderboard")
    .setDescription(description)
}

async function embedHouseIndividual(seasonId: number): Promise<EmbedBuilder> {
  const points = await PointActions.getPointLeaderboardIndividual(seasonId, 10)
  const sortedPoints = points.sort((a, b) => a.points! - b.points!)
  const users = await Promise.all(sortedPoints.map(async (pts, _) => await Users.getById(pts.user_id!)))
  let description = sortedPoints.map((x, idx) => {
    const user = users.find(u => u?.id === x.user_id)
    return `**#${idx + 1}**: <@${user?.discord_id}> (${x.points} points)`
  }).join("\n")
  if (description.length === 0) {
    description = "*No points awarded*"
  }
  return successEmbed
    .setTitle("House Leaderboard")
    .setDescription(description)
}

function embedNoActiveSeasons(): EmbedBuilder {
  return failureEmbed
    .setTitle("No Active Seasons")
    .setDescription(`There are no active seasons.`)
    .setFields([])
}

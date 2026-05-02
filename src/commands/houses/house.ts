import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from '../index.js';
import { HouseModel, Houses } from '../../db/houses.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { CacheType, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { Seasons } from '../../db/seasons.js';
import { PointActions } from '../../db/point-actions.js';
import { UserModel, Users } from '../../db/users.js';

export default {
  data: {
    name: "house",
    description: "Get info about a house",
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "leaderboard",
        description: "See the individual points leaderboard for a house",
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "house",
            description: "House",
            required: true,
            autocomplete: true
          }
        ]
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "members",
        description: "Season ID to create the house within",
        options: [
          {
            type: ApplicationCommandOptionType.String,
            name: "house",
            description: "House",
            required: true,
            autocomplete: true
          }
        ]
      },
    ]
  },

  async autocomplete(interaction) {
    const guildId = BigInt(interaction.guild!.id);

    const activeSeason = await Seasons.getActive(guildId);
    if (activeSeason === undefined) return;
    const houses = await Houses.getBySeason(activeSeason.id);
    await interaction.respond(houses.map(h => (
      {
        name: `${h.house_emoji} ${h.house_name}`,
        value: h.id.toString()
      }
    )))
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.USE_BOT))) return
    if (!interaction.isChatInputCommand()) return;
    const subcommand = interaction.options.getSubcommand(false)
    if (subcommand != null) {
      if (subcommand === "leaderboard") {
        await leaderboard(interaction)
      }
      else if (subcommand === "members") {
        await members(interaction)
      }
      else {
        await interaction.reply({ embeds: [embedUnknownSubcommand()], flags: MessageFlags.Ephemeral });
      }
    }
    else {
      await interaction.reply({ embeds: [embedSubcommandRequired()], flags: MessageFlags.Ephemeral });
    }
  },
} satisfies Command;

async function leaderboard(interaction: ChatInputCommandInteraction<CacheType>) {
  const houseId = parseInt(interaction.options.getString("house")!)
  const house = await Houses.getById(houseId);
  if (house === undefined) {
    await interaction.reply({ embeds: [embedUnknownHouse()], flags: MessageFlags.Ephemeral });
    return
  }

  const pointTotals = await PointActions.getPointLeaderboardIndividualByHouse(house.id, 10);
  await interaction.reply({ embeds: [await embedLeaderboard(house, pointTotals)], flags: MessageFlags.Ephemeral });
}

async function members(interaction: ChatInputCommandInteraction<CacheType>) {
  const houseId = parseInt(interaction.options.getString("house")!)
  const house = await Houses.getById(houseId);
  if (house === undefined) {
    await interaction.reply({ embeds: [embedUnknownHouse()], flags: MessageFlags.Ephemeral });
    return
  }
  const users = await Users.getByHouse(house.id)
  await interaction.reply({ embeds: [await embedMembers(house, users)], flags: MessageFlags.Ephemeral });
}

function embedSubcommandRequired(): EmbedBuilder {
  return failureEmbed
    .setTitle("Subcommand Required")
    .setDescription("Please enter a subcommand")
    .setFields([
    ])
}

function embedUnknownSubcommand(): EmbedBuilder {
  return failureEmbed
    .setTitle("Unknown Subcommand")
    .setDescription("Subcommand entered was not known")
    .setFields([
    ])
}

function embedUnknownHouse(): EmbedBuilder {
  return failureEmbed
    .setTitle("Unknown House")
    .setDescription("Unknown house ID entered")
    .setFields([
    ])
}

async function embedLeaderboard(house: HouseModel, points: { user_id: bigint | null, points: number }[]): Promise<EmbedBuilder> {
  const sortedPoints = points.sort((a, b) => b.points! - a.points!)
  const users = await Promise.all(sortedPoints.map(async (pts, _) => await Users.getById(pts.user_id!)))
  let description = sortedPoints.map((x, idx) => {
    const user = users.find(u => u?.id === x.user_id)
    return `**#${idx + 1}**: <@${user?.discord_id}> (${x.points} points)`
  }).join("\n")
  if (description.length === 0) {
    description = "*No points awarded*"
  }
  return successEmbed
    .setTitle(`${house.house_emoji} ${house.house_name} Leaderboard`)
    .setDescription(description)
    .setFields([])
}

async function embedMembers(house: HouseModel, users: UserModel[]) {
  return successEmbed
    .setTitle(`${house.house_emoji} ${house.house_name} Members`)
    .setDescription(users.map(u => `<@${u.discord_id}>`).join(", "))
    .setFields([])
}

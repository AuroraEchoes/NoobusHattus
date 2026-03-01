import { ApplicationCommandOptionType } from '@discordjs/core';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';

export default {
  data: {
    name: 'activate-season',
    description: 'Activate a season',
    options: [
      {
        type: ApplicationCommandOptionType.Integer,
        name: "season-id",
        description: "Season ID",
        required: true,
      }
    ]
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;
    const seasonId = interaction.options.getInteger("season-id")!
    const seasonIsInGuild = await Seasons.existsInServer(seasonId, BigInt(interaction.guildId!));

    if (!seasonIsInGuild) {
      await interaction.reply({ embeds: [embedSeasonDoesNotExistInThisServer(seasonId)], flags: MessageFlags.Ephemeral });
      return
    }

    const changedSeason = await Seasons.setActive(seasonId, true)
    if (changedSeason.ok) {
      if (changedSeason.season !== undefined) {
        await interaction.reply({ embeds: [embedSuccess(changedSeason.season)], flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ embeds: [embedFailure(seasonId)], flags: MessageFlags.Ephemeral });
      }
    } else {
      await interaction.reply({ embeds: [embedOtherSeasonAlreadyActive(seasonId)], flags: MessageFlags.Ephemeral });
    }
  },
} satisfies Command;

function embedSuccess(season: SeasonModel): EmbedBuilder {
  return successEmbed
    .setTitle("Season activated")
    .setFields([
      { name: "Season Name", value: `${season.season_name}` },
      { name: "Season ID", value: `${season.id}` }
    ])
}

function embedFailure(seasonId: number): EmbedBuilder {
  return failureEmbed
    .setTitle("Could not activate season")
    .setDescription(`Season could not be activated. Either it doesn’t exist, or another season was already active.`)
    .setFields([
      { name: "Season ID", value: `${seasonId}` }
    ])
}

function embedOtherSeasonAlreadyActive(seasonId: number): EmbedBuilder {
  return failureEmbed
    .setTitle("Could not activate season")
    .setDescription(`Only one season can be active at a time. Is another season already active?`)
    .setFields([
      { name: "Season ID", value: `${seasonId}` }
    ])
}

function embedSeasonDoesNotExistInThisServer(seasonId: number): EmbedBuilder {
  return failureEmbed
    .setTitle("Could not activate season")
    .setDescription(`Season \`${seasonId}\` does not exist in this server.`)
    .setFields([
      { name: "Season ID", value: `${seasonId}` }
    ])
}

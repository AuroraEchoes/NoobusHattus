import { ApplicationCommandOptionType } from '@discordjs/core';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder } from 'discord.js';

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
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const seasonId = interaction.options.getInteger("season-id")!
    const changedSeason = await Seasons.setActive(seasonId, true)
    if (changedSeason === undefined) {
      await interaction.reply({ embeds: [embedFailure(seasonId)], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embedSuccess(changedSeason)], ephemeral: true });
    }
  },
} satisfies Command;

function embedSuccess(season: SeasonModel): EmbedBuilder {
  return successEmbed
    .setTitle("Season activated")
    .addFields([
      { name: "Season Name", value: `${season.season_name}` },
      { name: "Season ID", value: `${season.id}` }
    ])
}

function embedFailure(seasonId: number): EmbedBuilder {
  return failureEmbed
    .setTitle("Could not activate season")
    .setDescription(`Season could not be activated. Either it doesn’t exist, or was already activated.`)
    .setFields([
      { name: "Season ID", value: `${seasonId}` }
    ])
}

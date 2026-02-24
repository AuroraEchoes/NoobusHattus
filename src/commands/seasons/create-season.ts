import { ApplicationCommandOptionType } from '@discordjs/core';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { EmbedBuilder } from 'discord.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';

export default {
  data: {
    name: 'create-season',
    description: 'Create a new season',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "season-name",
        description: "Season name",
        required: true,
      }
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const seasonName = interaction.options.getString("season-name")!
    const newSeason = await Seasons.create(seasonName)
    if (newSeason === undefined) {
      await interaction.reply({ embeds: [embedFailure(seasonName)], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embedSuccess(newSeason)], ephemeral: true });
    }
  },
} satisfies Command;

function embedSuccess(season: SeasonModel): EmbedBuilder {
  return successEmbed
    .setTitle("Season created")
    .addFields([
      { name: "Season Name", value: `${season.season_name}` },
      { name: "Season ID", value: `${season.id}` }
    ])
}

function embedFailure(seasonName: string): EmbedBuilder {
  return failureEmbed
    .setTitle("Could not create season")
    .setDescription(`Season could not be created.`)
    .setFields([
      { name: "Season Name", value: `${seasonName}` }
    ])
}

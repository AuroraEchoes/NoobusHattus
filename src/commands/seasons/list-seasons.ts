import { EmbedBuilder } from 'discord.js';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import { Permission, PermissionManager } from '../../permissions.js';
import type { Command } from '../index.js';
import { successEmbed } from '../../lib/embeds.js';

export default {
  data: {
    name: 'list-seasons',
    description: 'List all seasons',
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    const allSeasons = await Seasons.get()
    if (allSeasons.length === 0) {
      await interaction.reply({ embeds: [embedNoSeasons()], ephemeral: true });
    }
    else {
      await interaction.reply({ embeds: [embedSuccess(allSeasons)], ephemeral: true });
    }
  },
} satisfies Command;

function embedSuccess(seasons: SeasonModel[]): EmbedBuilder {
  return successEmbed
    .setTitle("Season list")
    .setDescription(seasons.map((season, _) => `\`${season.id}\` ${season.season_name}: \`${season.is_active ? "ACTIVE" : "INACTIVE"}\``).join("\n"))
}

function embedNoSeasons(): EmbedBuilder {
  return successEmbed
    .setTitle("No seasons")
    .setDescription(`There are no seasons. Create one using \`/create-season\``)
}

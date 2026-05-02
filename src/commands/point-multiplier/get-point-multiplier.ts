import { EmbedBuilder, MessageFlags } from 'discord.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { Permission, PermissionManager } from '../../permissions.js';
import type { Command } from '../index.js';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import { SeasonMultiplierModel, SeasonMultipliers } from '../../db/season-multipiers.js';

export default {
  data: {
    name: "get-point-multiplier",
    description: "Get the current point multiplier for the active season",
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;
    const guildId = BigInt(interaction.guildId!)
    const activeSeason = await Seasons.getActive(guildId)
    if (activeSeason === undefined) {
      await interaction.reply({ embeds: [embedNoActiveSeason()], flags: MessageFlags.Ephemeral });
      return;
    }
    const multiplier = await SeasonMultipliers.getBySeason(activeSeason.id);

    if (multiplier === undefined) {
      await interaction.reply({ embeds: [embedMultiplerNotSet()], flags: MessageFlags.Ephemeral });
      return
    }

    await interaction.reply({ embeds: [embedSuccess(activeSeason, multiplier)], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embedSuccess(season: SeasonModel, multiplier: SeasonMultiplierModel): EmbedBuilder {
  return successEmbed
    .setTitle("Point Multiplier")
    .setDescription(`Point multiplier for ${season.season_name}: \`${multiplier.point_multiplier}×\``)
    .setFields([])
}

function embedNoActiveSeason(): EmbedBuilder {
  return failureEmbed
    .setTitle("No Active Season")
    .setDescription("This guild has no active season")
    .setFields([
    ])
}

function embedMultiplerNotSet(): EmbedBuilder {
  return failureEmbed
    .setTitle("No Multiplier Set")
    .setDescription("No points multiplier has been set for this season")
    .setFields([
    ])
}

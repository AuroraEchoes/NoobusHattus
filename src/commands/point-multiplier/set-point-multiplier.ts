import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } from 'discord.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { Permission, PermissionManager } from '../../permissions.js';
import type { Command } from '../index.js';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import { SeasonMultipliers } from '../../db/season-multipiers.js';

export default {
  data: {
    name: "set-point-multiplier",
    description: "Set the current point multiplier for the active season",
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "multiplier",
        description: "Points multiplier",
      }
    ]
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;

    const guildId = BigInt(interaction.guildId!)
    const newMultiplier = parseFloat(interaction.options.getString("multiplier")!)
    if (Number.isNaN(newMultiplier)) {
      await interaction.reply({ embeds: [embedMultiplierIsNotFloat()], flags: MessageFlags.Ephemeral });
      return;
    }
    const activeSeason = await Seasons.getActive(guildId)
    if (activeSeason === undefined) {
      await interaction.reply({ embeds: [embedNoActiveSeason()], flags: MessageFlags.Ephemeral });
      return;
    }
    await SeasonMultipliers.setBySeason(activeSeason.id, newMultiplier);
    await interaction.reply({ embeds: [embedSuccess(activeSeason, newMultiplier)], flags: MessageFlags.Ephemeral });
  },
} satisfies Command;

function embedSuccess(season: SeasonModel, multiplier: number): EmbedBuilder {
  return successEmbed
    .setTitle("Point Multiplier")
    .setDescription(`Set point multiplier for ${season.season_name}: \`${multiplier}×\``)
    .setFields([])
}

function embedNoActiveSeason(): EmbedBuilder {
  return failureEmbed
    .setTitle("No Active Season")
    .setDescription("This guild has no active season")
    .setFields([
    ])
}

function embedMultiplierIsNotFloat(): EmbedBuilder {
  return failureEmbed
    .setTitle("Invalid Multiplier")
    .setDescription("Multiplier must be castable to a float")
    .setFields([
    ])
}

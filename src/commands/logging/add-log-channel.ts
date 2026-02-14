import { ApplicationCommandOptionType } from '@discordjs/core';
import { SeasonModel, Seasons } from '../../db/seasons.js';
import type { Command } from '../index.js';
import { LogChannelModel, LogChannels } from '../../db/log-channels.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder } from 'discord.js';

export default {
  data: {
    name: "add-log-channel",
    description: "Add the current channel as a log channel (to log actions for a season)",
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
    const channelId = BigInt(interaction.channelId);
    const guildId = BigInt(interaction.guildId!);
    const season = await Seasons.getById(seasonId)
    if (season === undefined) {
      await interaction.reply({ embeds: [embedFailureSeason(seasonId)], ephemeral: true })
      return
    }
    const logChannel = await LogChannels.create(seasonId, channelId, guildId)
    if (logChannel === undefined) {
      await interaction.reply({ embeds: [embedFailureLogChannel(channelId)], ephemeral: true })
      return
    }
    await interaction.reply({ embeds: [embedSuccess(logChannel, season)], ephemeral: true })
  },
} satisfies Command;

function embedSuccess(logChannel: LogChannelModel, season: SeasonModel): EmbedBuilder {
  return successEmbed
    .setTitle("Added Log Channel")
    .setDescription(`<#${logChannel.channel_id}> will now log events for season ${season?.season_name} (\`${season?.id}\`)`)
}

function embedFailureLogChannel(channelId: bigint): EmbedBuilder {
  return failureEmbed
    .setTitle("Failed to add Log Channel")
    .setDescription(`<#${channelId}> could not be added as a log channel. Is there already a season logging in this channel? This can be checked using \`/list-log-channels\`.`)
}

function embedFailureSeason(seasonId: number): EmbedBuilder {
  return failureEmbed
    .setTitle("Failed to add Log Channel")
    .setDescription(`Provided season (\`${seasonId}\`) does not exist`)
}

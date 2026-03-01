import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { failureEmbed, successEmbed } from '../../lib/embeds.js';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { LogChannelModel, LogChannels } from '../../db/log-channels.js';

export default {
  data: {
    name: "query-log-channel",
    description: "Query this server’s log channel",
  },

  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT))) return
    if (!interaction.isChatInputCommand()) return;

    const guildId = BigInt(interaction.guildId!)
    const logChannel = await LogChannels.getByGuild(guildId)

    if (logChannel === undefined) {
      await interaction.reply({ embeds: [embedNoLogChannel()], flags: MessageFlags.Ephemeral })
      return
    }
    await interaction.reply({ embeds: [embed(logChannel)], flags: MessageFlags.Ephemeral })
  },
} satisfies Command;

function embed(logChannel: LogChannelModel): EmbedBuilder {
  return successEmbed
    .setTitle(`Log channel`)
    .setDescription(`Log channel for this server is <#${logChannel.channel_id}>`)
    .setFields([])
}

function embedNoLogChannel(): EmbedBuilder {
  return failureEmbed
    .setTitle("No log channel")
    .setDescription(`This server does not have a log channel. Add one using /add-log-channel.`)
    .setFields([])
}

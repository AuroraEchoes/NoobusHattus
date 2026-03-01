import { ApplicationCommandOptionType, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { LogsTfResponse } from './type-spec.js';
import { LogAwards } from './log-awards.js';
import { ProcessedLogs } from '../../db/processed-logs.js';
import { failureEmbed, successEmbed } from '../../lib/embeds.js';

export default {
  data: {
    name: 'upload-log',
    description: 'Upload a noob pugs log to the house system',
    options: [
      {
        type: ApplicationCommandOptionType.String,
        name: "log",
        description: "Log (either link, or log ID)",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.User,
        name: "red-captain",
        description: "RED team captain",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.User,
        name: "blu-captain",
        description: "BLU team captain",
        required: true,
      },
    ]
  },
  async execute(interaction) {
    if (!(await PermissionManager.requirePermission(interaction, Permission.UPLOAD_LOGS))) return
    if (!interaction.isChatInputCommand()) return
    const logString = interaction.options.getString("log")!
    const userId = BigInt(interaction.user.id)
    const regex = /(?:https?:\/\/)?(?:logs\.tf\/)?(\d+).*/
    const result = logString.match(regex)
    if (result === null) {
      await interaction.reply({ embeds: [(logLinkInvalidEmbed())], flags: MessageFlags.Ephemeral });
    }
    else {
      const logId = result[1]
      if (await ProcessedLogs.contains(BigInt(logId))) {
        await interaction.reply({ embeds: [(logAlreadyProcessedEmbed(logId))], flags: MessageFlags.Ephemeral });
      }
      else {
        const redCap = interaction.options.getUser("red-captain")!
        const bluCap = interaction.options.getUser("blu-captain")!
        const logsTfResponse = await queryLog(logId)
        if (logsTfResponse === undefined) {
          await interaction.reply({ embeds: [logNotFoundEmbed(logId)], flags: MessageFlags.Ephemeral });
        }
        else {
          const guildId = BigInt(interaction.guildId!)
          LogAwards.applyAwards(guildId, logsTfResponse, BigInt(redCap.id), BigInt(bluCap.id))
          await ProcessedLogs.add(BigInt(logId))
          await interaction.reply({ embeds: [embed(userId, logId)] });
        }
      }
    }
  },
} satisfies Command;

async function queryLog(logId: string): Promise<undefined | LogsTfResponse> {
  const res = await fetch(`http://logs.tf/json/${logId}`, {
    method: 'GET',
  })

  if (!res.ok) {
    return undefined
  }
  else {
    return await res.json() as LogsTfResponse
  }
}

function embed(userId: BigInt, logId: string): EmbedBuilder {
  return successEmbed
    .setTitle("Log successfully processed")
    .setDescription(" ")
    .setFields([
      { name: "Uploader", value: `<@${userId}>`, inline: true },
      { name: "Log ID", value: `\`${logId}\``, inline: true },
    ])
}

function logNotFoundEmbed(logId: string): EmbedBuilder {
  return failureEmbed
    .setTitle("Log not found")
    .setDescription("Did you enter the right ID/URL?")
    .setFields([
      { name: "Log ID", value: `\`${logId}\``, inline: true },
    ])
}

function logLinkInvalidEmbed(): EmbedBuilder {
  return failureEmbed
    .setTitle("Log format invalid")
    .setDescription("Please upload either the link (i.e. `https://logs.tf/LOG_ID`) or the log (i.e. `LOG_ID`")
    .setFields([])
}

function logAlreadyProcessedEmbed(logId: string): EmbedBuilder {
  return failureEmbed
    .setTitle("Log already processed")
    .setDescription(" ")
    .setFields([
      { name: "Log ID", value: `\`${logId}\``, inline: true },
    ])

}

import { ApplicationCommandOptionType } from 'discord.js';
import type { Command } from '../index.js';
import { Permission, PermissionManager } from '../../permissions.js';
import { LogsTfResponse } from './type-spec.js';
import { LogAwards } from './log-awards.js';
import { ProcessedLogs } from '../../db/processed-logs.js';

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
    if (!PermissionManager.requirePermission(interaction, Permission.UPLOAD_LOGS)) return
    if (!interaction.isChatInputCommand()) return
    const logString = interaction.options.getString("log")!
    const regex = /(?:https?:\/\/)?(?:logs\.tf\/)?(\d+).*/
    const result = logString.match(regex)
    if (result === null) {
      interaction.reply("Could not process log link. Please upload either the link (i.e. `https://logs.tf/LOG_ID`) or the log (i.e. `LOG_ID`")
    }
    else {
      const logId = result[1]
      if (await ProcessedLogs.contains(BigInt(logId))) {
        interaction.reply("This log has already been processed")
      }
      else {
        const redCap = interaction.options.getUser("red-captain")!
        const bluCap = interaction.options.getUser("blu-captain")!
        const logsTfResponse = await queryLog(logId)
        if (logsTfResponse === undefined) {
          interaction.reply("Log could not be found (did you enter the right ID/URL?)")
        }
        else {
          LogAwards.applyAwards(logsTfResponse, BigInt(redCap.id), BigInt(bluCap.id))
          interaction.reply(`Successfully processed log \`${logId}\``)
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

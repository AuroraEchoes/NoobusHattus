import { client } from "./client.js";
import { Houses } from "./db/houses.js";
import { LogChannels } from "./db/log-channels.js";
import { LoggedMessages } from "./db/logged-messages.js";
import { PointActionModel, PointActions } from "./db/point-actions.js";
import { SummaryMessages } from "./db/summary-messages.js";
import { Users } from "./db/users.js";

export class Logging {
  static async logAction(action: PointActionModel) {
    const targetHouse = await Houses.getById(action.house_id!);
    const seasonId = targetHouse?.season_id!
    const logChannels = await LogChannels.getBySeason(targetHouse?.season_id!);
    const target = await Users.getById(BigInt(action.target_id));
    for (const channel of logChannels) {
      const textChannel = client.channels.cache.get(channel.channel_id.toString())!
      if (!textChannel.isSendable()) {
        console.warn("Attempted to log to a non-text channel (?)")
        return
      }
      // Delete current summary message
      const currSummaryMessage = await SummaryMessages.getBySeasonByChannel(seasonId, channel.guild_id, channel.channel_id)
      if (currSummaryMessage !== undefined) {
        const message = await textChannel.messages.fetch(currSummaryMessage.message_id.toString())
        const deletionResult = await message.delete()
        console.log(message.deletable)
        if (deletionResult) {
          console.warn("Could not successfully delete the previous summary message (?)")
        }
      }

      // Send updated status message
      const message = `<@${target?.discord_id}> earned ${action.point_value} point${action.point_value !== 1 ? "s" : ""} for ${targetHouse?.house_emoji} ${targetHouse?.house_name} (${action.reason})`
      const sentMsg = await textChannel.send(message)
      await LoggedMessages.create(action.id, channel.channel_id, channel.guild_id, BigInt(sentMsg.id))

      // Send updated summary message
      let housePoints = await PointActions.getPointTotalsBySeason(seasonId)
      housePoints = housePoints.sort((a, b) => parseInt(b.points!) - parseInt(a.points!))

      let msgBuf = ["## Updated Scoring"]
      for (const houseTotal of housePoints) {
        const house = await Houses.getById(houseTotal.house_id!)
        msgBuf.push(`**${houseTotal.points} points**: ${house?.house_emoji} ${house?.house_name}`)
      }

      const msg = await textChannel.send(msgBuf.join("\n"))
      const msgId = msg.id;
      await SummaryMessages.createOrUpdateMessageId(channel.guild_id, channel.channel_id, BigInt(msgId))
    }
  }
}

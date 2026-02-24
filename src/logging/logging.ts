import { Houses } from "../db/houses.js";
import { LogChannelModel, LogChannels } from "../db/log-channels.js";
import { PointActionModel } from "../db/point-actions.js";
import { Seasons } from "../db/seasons.js";
import { ChannelQueue } from "./channel-queue.js";

export class Logging {
  static channelQueues: Map<string, ChannelQueue> = new Map<string, ChannelQueue>()

  static async logAction(action: PointActionModel) {
    const house = await Houses.getById(action.house_id!);
    const seasonId = house!.season_id!;
    const season = await Seasons.getById(seasonId)
    if (season === undefined) return

    const channel = await LogChannels.getByGuild(season.guild_id)
    if (channel === undefined) return

    const queue = this.getOrCreateQueue(channel)
    queue.enqueue(action)
  }

  static getOrCreateQueue(channelModel: LogChannelModel): ChannelQueue {
    const key = `${channelModel.guild_id}:${channelModel.channel_id}`;
    if (this.channelQueues.has(key)) {
      return this.channelQueues.get(key)!
    } else {
      this.channelQueues.set(key, new ChannelQueue(channelModel.guild_id, channelModel.channel_id))
      return this.channelQueues.get(key)!
    }
  }
}

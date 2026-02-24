import { EmbedBuilder } from "discord.js";
import { client } from "../client.js";
import { HouseModel, Houses } from "../db/houses.js";
import { LoggedMessages } from "../db/logged-messages.js";
import { PointActionModel, PointActions } from "../db/point-actions.js";
import { Seasons } from "../db/seasons.js";
import { SummaryMessages } from "../db/summary-messages.js";
import { Users } from "../db/users.js";
import { failureEmbed, successEmbed } from "../lib/embeds.js";

export class ChannelQueue {
  private running = false;
  private pendingActions: PointActionModel[] = [];

  public constructor(
    private guildId: bigint,
    private channelId: bigint
  ) { }


  public enqueue(action: PointActionModel) {
    this.pendingActions.push(action);
    this.start();
  }

  private async start() {
    if (this.running) return;
    this.running = true;

    while (this.pendingActions.length > 0) {
      // Debounce window: collect actions for 150ms
      await new Promise(r => setTimeout(r, 150));

      const batch = this.pendingActions.splice(0);
      await this.processBatch(batch);
    }

    this.running = false;
  }

  private async processBatch(actions: PointActionModel[]) {
    const textChannel = client.channels.cache.get(this.channelId.toString());
    if (!textChannel?.isSendable()) return;

    const currSummary = await SummaryMessages.getByGuildIdChannelId(
      this.guildId,
      this.channelId
    );

    if (currSummary !== undefined) {
      try {
        const msg = await textChannel.messages.fetch(currSummary.message_id.toString());
        await msg.delete();
      } catch { }
    }

    // Send individual log messages
    for (const action of actions) {
      const target = await Users.getById(BigInt(action.target_id));
      const house = await Houses.getById(action.house_id!);

      const sent = await textChannel.send({ embeds: [embedPointChange(target?.discord_id!, action, house!)] });

      await LoggedMessages.create(
        action.id,
        this.channelId,
        this.guildId,
        BigInt(sent.id)
      );
    }

    // Send ONE summary message
    const season = (await Seasons.getActive(this.guildId))!
    let totals = await PointActions.getPointTotalsBySeason(season.id);
    const model = await Promise.all(totals.map(async (total, _) => { return { points: total.points!, house: (await Houses.getById(total.house_id!))! } }))

    const summary = await textChannel.send({ embeds: [embedPointSummary(model)] });
    await SummaryMessages.createOrUpdateMessageId(
      this.guildId,
      this.channelId,
      BigInt(summary.id)
    );
  }
}

function embedPointChange(discordId: bigint, action: PointActionModel, house: HouseModel): EmbedBuilder {
  return (action.point_value > 0 ? successEmbed : failureEmbed)
    .setTitle(`${action.point_value} points to **${house?.house_emoji} ${house?.house_name}**`)
    .setDescription(`<@${discordId}> earned ${action.point_value} points\n\n*${action.reason}*`)
    .setFields([])
}

function embedPointSummary(model: { points: number, house: HouseModel }[]): EmbedBuilder {
  model.sort((a, b) => b.points - a.points);
  return successEmbed
    .setTitle(`House Points Leaderboard`)
    .setDescription(model.map((house, idx) => `**#${idx + 1}** (\`${house.points}\` points): **${house.house?.house_emoji} ${house.house?.house_name}**`).join("\n"))
    .setFields([])
}

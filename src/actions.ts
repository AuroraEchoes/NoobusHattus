import { Houses } from "./db/houses.js";
import { PointActions } from "./db/point-actions.js";
import { SeasonMultipliers } from "./db/season-multipiers.js";
import { Seasons } from "./db/seasons.js";
import { Users } from "./db/users.js";
import { Logging } from "./logging/logging.js";

export class ActionManager {
  static async applyActionAsUser(guildId: bigint, targetDiscordId: bigint, sourceDiscordId: bigint, reason: string, value: number): Promise<void> {
    const targetId = await Users.getByDiscordId(targetDiscordId)
    const sourceId = await Users.getByDiscordId(sourceDiscordId)
    if (targetId === undefined) {
      return undefined
    }
    return this.applyAction(guildId, targetId.id, sourceId?.id, reason, value, true)
  }

  static async applyActionAsSystem(guildId: bigint, targetId: bigint, reason: string, value: number): Promise<void> {
    return this.applyAction(guildId, targetId, undefined, reason, value, false)
  }

  static async applyAction(guildId: bigint, targetId: bigint, sourceId: bigint | undefined, reason: string, value: number, bypassMultiplier: boolean): Promise<void> {
    let modifiedValue = value;
    if (!bypassMultiplier) {
      const season = await Seasons.getActive(guildId)
      if (season !== undefined) {
        const seasonMult = await SeasonMultipliers.getBySeason(season.id)
        if (seasonMult !== undefined)
          modifiedValue *= seasonMult.point_multiplier;
      }
    }
    const activeSeason = await Seasons.getActive(guildId);
    if (activeSeason === undefined) return

    const house = await Houses.getByUserBySeason(targetId, activeSeason.id)
    if (house === undefined) return

    const action = await PointActions.insert(Number(targetId), house.id, sourceId, reason, modifiedValue)
    if (action === undefined) return

    Logging.logAction(action)
  }
}

import { Houses } from "./db/houses.js";
import { PointActionModel, PointActions } from "./db/point-actions.js";
import { Seasons } from "./db/seasons.js";
import { Users } from "./db/users.js";
import { Logging } from "./logging.js";

export class ActionManager {
  static async applyActionAsUser(targetDiscordId: bigint, sourceDiscordId: bigint, reason: string, value: number): Promise<PointActionModel[] | undefined> {
    const targetId = await Users.getByDiscordId(targetDiscordId)
    const sourceId = await Users.getByDiscordId(sourceDiscordId)
    if (targetId === undefined) {
      return undefined
    }
    return this.applyAction(targetId.id, sourceId?.id, reason, value)
  }

  static async applyActionAsSystem(targetId: bigint, reason: string, value: number): Promise<PointActionModel[] | undefined> {
    return this.applyAction(targetId, undefined, reason, value)
  }

  static async applyAction(targetId: bigint, sourceId: bigint | undefined, reason: string, value: number): Promise<PointActionModel[] | undefined> {
    const actions = []
    const activeSeasons = await Seasons.getActive();
    for (const season of activeSeasons) {
      const house = await Houses.getByUserBySeason(targetId, season.id)
      if (house !== undefined) {

        const action = await PointActions.insert(Number(targetId), house.id, sourceId, reason, value)
        if (action !== undefined) {
          await Logging.logAction(action)
          actions.push(action)
        }
      }
    }
    return actions;
  }
}

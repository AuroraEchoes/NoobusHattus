import { Houses } from "./db/houses.js";
import { PointActionModel, PointActions } from "./db/point-actions.js";
import { Seasons } from "./db/seasons.js";
import { Users } from "./db/users.js";
import { Logging } from "./logging.js";

export class ActionManager {
  static async applyActionAsUser(targetDiscordId: bigint, sourceDiscordId: bigint, reason: string, value: number): Promise<PointActionModel[] | undefined> {
    return this.applyAction(targetDiscordId, sourceDiscordId, reason, value)
  }

  static async applyActionAsSystem(targetDiscordId: bigint, reason: string, value: number): Promise<PointActionModel[] | undefined> {
    return this.applyAction(targetDiscordId, undefined, reason, value)
  }

  static async applyAction(targetDiscordId: bigint, sourceDiscordId: bigint | undefined, reason: string, value: number): Promise<PointActionModel[] | undefined> {
    const target = await Users.findOrCreate(targetDiscordId)
    const source = sourceDiscordId !== undefined ? await Users.findOrCreate(sourceDiscordId) : undefined
    const actions = []
    if (target === undefined) {
      return undefined;
    }
    const activeSeasons = await Seasons.getActive();
    for (const season of activeSeasons) {
      const house = await Houses.getByUserBySeason(target.id, season.id)
      if (house !== undefined) {

        const action = await PointActions.insert(Number(target.id), house.id, source?.id, reason, value)
        if (action !== undefined) {
          await Logging.logAction(action)
          actions.push(action)
        }
      }
    }
    return actions;
  }
}

import { ActionManager } from "../../actions.js";
import { Users } from "../../db/users.js";
import { id3ToId64 } from "../../lib/steam.js";
import { LogsTfResponse } from "./type-spec.js";

type LogAwardCategory = {
  pointValue: number,
  reason: string,
  eligibleUserIds(log?: LogsTfResponse, redCapDiscord?: bigint, bluCapDiscord?: bigint): Promise<bigint[]> | bigint[]
}

const captainTeamAward = {
  pointValue: 10,
  reason: "Captained a pug",
  async eligibleUserIds(_, redCapDiscord, bluCapDiscord) {
    const eligibleUsers = [await Users.getByDiscordId(redCapDiscord!), await Users.getByDiscordId(bluCapDiscord!)]
    return eligibleUsers.filter(user => user !== undefined).map(user => user.id)
  },
} satisfies LogAwardCategory

const winPugAward = {
  pointValue: 5,
  reason: "Won a pug",
  async eligibleUserIds(log) {
    const redScore = log!.teams.Red.score
    const bluScore = log!.teams.Blue.score
    if (redScore === bluScore) {
      return []
    }
    else {
      const eligibleUsers = []
      const redWon = redScore > bluScore
      for (const [steamId3, player] of Object.entries(log!.players)) {
        const playerWon = (redWon && player.team === "Red") || (!redWon && player.team === "Blue")
        if (playerWon) {
          const steamId = id3ToId64(steamId3)
          const user = await Users.getBySteamId(steamId)
          if (user !== undefined) {
            eligibleUsers.push(user.id)
          }
        }
      }
      return eligibleUsers
    }
  },
} satisfies LogAwardCategory

const playMedAward = {
  pointValue: 5,
  reason: "Played Medic in a pug",
  async eligibleUserIds(log) {
    const eligibleUsers = []
    for (const [steamId3, player] of Object.entries(log!.players)) {
      for (const classStat of player.class_stats) {
        if (classStat.type === "medic" && classStat.total_time > 15 * 60) { // Mandate 15 minutes on medic for the award
          const user = await Users.getBySteamId(id3ToId64(steamId3))
          if (user !== undefined) {
            eligibleUsers.push(user.id)
          }
        }
      }
    }
    return eligibleUsers
  }
} satisfies LogAwardCategory

export class LogAwards {
  static awardCategories = [captainTeamAward, winPugAward, playMedAward]
  static async applyAwards(log: LogsTfResponse, redCapDiscord: bigint, bluCapDiscord: bigint) {
    for (const award of this.awardCategories) {
      const eligibleUsers = await award.eligibleUserIds(log, redCapDiscord, bluCapDiscord)
      for (const userId of eligibleUsers) {
        ActionManager.applyActionAsSystem(userId, award.reason, award.pointValue)
      }
    }
  }
}

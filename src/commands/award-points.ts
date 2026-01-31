import { ApplicationCommandOptionType } from '@discordjs/core';
import type { Command } from './index.js';
import { ActionManager } from '../actions.js';

export default {
  data: {
    name: "award-points",
    description: "Give the target player points",
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "target",
        description: "Target (point recipient)",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.Integer,
        name: "amount",
        description: "Number of points to award",
        required: true
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "reason",
        description: "Reason for point award",
        required: true
      }
    ]
  },

  // TODO: Add some sort of security verification to ensure the user should be able to run this command
  // DO NOT LAUNCH WITHOUT THIS
  // OR YOUR KNEECAPS WILL BE MINE
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const target = BigInt(interaction.options.getUser("target")!.id)
    const amount = interaction.options.getInteger("amount")!
    const reason = interaction.options.getString("reason")!
    const source = BigInt(interaction.user.id)

    const result = await ActionManager.applyActionAsUser(target, source, reason, amount)
    if (result === undefined || result.length === 0) {
      await interaction.reply(`Could not award points to <@${target}> (are they a member of an active house?)`)
    }
    else {
      await interaction.reply(`Awarded \`${amount}\` points to <@${target}> for ${reason}`)
    }
  },
} satisfies Command;

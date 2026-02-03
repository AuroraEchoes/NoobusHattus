import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from "../index.js";
import { sortUser } from "./sorting-hat.js";
import { Permission, PermissionManager } from "../../permissions.js";

export default {
  data: {
    name: "force-sort",
    description: "Force sort another player",
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: "target",
        description: "Target",
        required: true,
      }
    ]
  },
  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const target = interaction.options.getUser("target")!
    sortUser(interaction, target.id)
  },
} satisfies Command;

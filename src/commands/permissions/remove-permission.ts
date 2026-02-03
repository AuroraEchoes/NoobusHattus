import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { PermissionRoles } from "../../db/permission-roles.js";
import { permissionChoices } from "./permission-utils.js";

export default {
  data: {
    name: "remove-permission",
    description: "Remove the selected permission from target role",
    options: [
      {
        type: ApplicationCommandOptionType.Role,
        name: "role",
        description: "Target role",
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: "permission",
        description: "Permission to remove",
        required: true,
        choices: permissionChoices()
      }
    ]
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const role = interaction.options.getRole("role")!
    const permission = interaction.options.getString("permission")! as unknown as Permission
    const alreadyHasRole = (await PermissionRoles.getRolesWithPermission(permission))
      .map(role => role.role_id)
      .includes(BigInt(role.id))
    if (!alreadyHasRole) {
      interaction.reply(`Role <@&${role.id}> already does not have permission ${permission}`)
    }
    else {
      const res = await PermissionRoles.removePermissionFromRole(permission, BigInt(role.id))
      if (res === undefined) {
        interaction.reply(`Error removing <@&${role.id}> permission ${permission}`)
      } else {
        interaction.reply(`Removed <@&${role.id}> permission ${permission}`)
      }
    }
  },
} satisfies Command;

import { ApplicationCommandOptionType } from "discord.js";
import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { PermissionRoles } from "../../db/permission-roles.js";
import { permissionChoices } from "./permission-utils.js";

export default {
  data: {
    name: "add-permission",
    description: "Give the target role the selected permission",
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
        description: "Permission to add",
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
    if (alreadyHasRole) {
      interaction.reply(`Role <@&${role.id}> already has permission ${permission}`)
    }
    else {
      const res = await PermissionRoles.addPermissionToRole(permission, BigInt(role.id))
      if (res === undefined) {
        interaction.reply(`Error giving <@&${role.id}> permission ${permission}`)
      } else {
        interaction.reply(`Gave <@&${role.id}> permission ${permission}`)
      }
    }
  },
} satisfies Command;

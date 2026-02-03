import type { Command } from '../index.js';
import { Permission, PermissionManager } from "../../permissions.js";
import { PermissionRoles } from "../../db/permission-roles.js";

export default {
  data: {
    name: "list-permissions",
    description: "List all roles and their permissions",
  },

  async execute(interaction) {
    if (!PermissionManager.requirePermission(interaction, Permission.MANAGE_BOT)) return
    if (!interaction.isChatInputCommand()) return;
    const msgBuf = [`### Bot Permissions`]

    const permissionNames = Object.values(Permission).filter(val => typeof val === "string")
    for (const permission of permissionNames) {
      const rolesWithPermission = await PermissionRoles.getRolesWithPermission(permission as unknown as Permission)
      msgBuf.push(`\`${permission}\`: ${rolesWithPermission.length === 0 ? "None" : rolesWithPermission.map(role => `<@&${role.role_id}>`).join(", ")}`)
    }
    interaction.reply(msgBuf.join("\n"))
  },
} satisfies Command;

import { CacheType, CommandInteraction, EmbedBuilder, GuildMemberRoleManager, MessageFlags } from "discord.js"
import { PermissionRoles } from "./db/permission-roles.js"
import { failureEmbed } from "./lib/embeds.js"

export enum Permission {
  USE_BOT,
  UPLOAD_LOGS,
  AWARD_POINTS,
  MANAGE_BOT
}

export class PermissionManager {
  static async requirePermission(interaction: CommandInteraction<CacheType>, permission: Permission): Promise<boolean> {
    // Short-circuit admins, so someone can set it up initially
    if (interaction.memberPermissions?.serialize().Administrator) {
      return true
    }
    const requiredRoles = (await PermissionRoles.getRolesWithPermission(permission))
      .map((role, _) => role.role_id)
    let roles = interaction.member?.roles
    if (roles === undefined) {
      return false
    }
    else if (roles instanceof GuildMemberRoleManager) {
      roles = roles.cache.map((val, _) => val.id)
    }

    for (const role of roles) {
      if (requiredRoles.includes(BigInt(role))) {
        return true
      }
    }
    await interaction.reply({ embeds: [embed(permission)], flags: MessageFlags.Ephemeral });
    return false
  }
}

function embed(requiredPermission: Permission): EmbedBuilder {
  return failureEmbed
    .setTitle("Permission missing")
    .setDescription(`You must have permission ${Permission[requiredPermission]} to do this`)
    .setFields([])
}

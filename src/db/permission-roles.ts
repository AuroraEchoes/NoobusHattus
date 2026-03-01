import { and, eq, InferSelectModel } from "drizzle-orm";
import { permission_roles } from "./schema.js";
import { Permission } from "../permissions.js";
import { db } from "../lib/db.js";

export type PermissionRoleModel = InferSelectModel<typeof permission_roles>

export class PermissionRoles {
  static async getRolesWithPermission(permission: Permission): Promise<PermissionRoleModel[]> {
    const roles = await db.select().from(permission_roles).where(eq(permission_roles.permission, Permission[permission]))
    return roles
  }

  static async addPermissionToRole(permission: Permission, roleId: bigint): Promise<PermissionRoleModel | undefined> {
    const permissionRole = await db.insert(permission_roles)
      .values({ role_id: roleId, permission: Permission[permission] })
      .onConflictDoNothing()
      .returning()
    return permissionRole.length === 1 ? permissionRole[0] : undefined
  }

  static async removePermissionFromRole(permission: Permission, roleId: bigint): Promise<PermissionRoleModel | undefined> {
    const permissionRole = await db.delete(permission_roles)
      .where(and(eq(permission_roles.role_id, roleId), eq(permission_roles.permission, Permission[permission])))
      .returning()
    return permissionRole.length === 1 ? permissionRole[0] : undefined
  }
}

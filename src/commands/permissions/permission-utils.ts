import { Permission } from "../../permissions.js"

export function permissionChoices(): { name: string, value: string }[] {
  const permissions = Object.values(Permission).filter(val => typeof val === "string").map(val => ({
    name: val.toString(),
    value: val.toString()
  }))
  return permissions
}


export type PermissionSubject = { permissions: readonly string[] };

export function hasPermission(subject: PermissionSubject, permission: string) {
  return subject.permissions.includes(permission);
}

export function hasAnyPermission(subject: PermissionSubject, permissions: readonly string[]) {
  return permissions.some(permission => hasPermission(subject, permission));
}

export function hasAllPermissions(subject: PermissionSubject, permissions: readonly string[]) {
  return permissions.every(permission => hasPermission(subject, permission));
}

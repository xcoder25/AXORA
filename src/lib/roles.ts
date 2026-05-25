const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  teacher: 'Faculty',
  student: 'Scholar',
  parent: 'Guardian',
  security: 'Security',
};

export function formatRoleLabel(role?: string | null): string {
  if (!role) return 'Loading…';
  return ROLE_LABELS[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
}

export function isAdminRole(role?: string | null): boolean {
  return role === 'admin';
}

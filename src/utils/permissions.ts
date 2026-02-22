import { UserPermissions } from '@/types/grocery';
import { getCurrentUser } from './auth';

/**
 * Check whether the current user has *view* access to a section.
 */
export function hasSectionAccess(section: keyof UserPermissions): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!user.permissions?.[section]?.view;
}

/**
 * Check whether the current user has a specific action permission on a section.
 * Action may be one of 'view'|'create'|'edit'|'delete'.
 */
export function hasPermission(
  section: keyof UserPermissions,
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.role === 'admin') return true;
  return !!user.permissions?.[section]?.[action];
}

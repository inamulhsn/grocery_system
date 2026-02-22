import { Profile } from '@/types/grocery';

/**
 * Returns the currently logged-in user profile from localStorage.
 * If no user is stored, returns null.
 */
export function getCurrentUser(): Profile | null {
  const saved = localStorage.getItem('grocery_user');
  return saved ? (JSON.parse(saved) as Profile) : null;
}

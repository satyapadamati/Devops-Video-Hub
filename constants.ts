import { Content, Permission } from './types';

export const PERMANENT_ADMIN_EMAIL = 'satyapadamati5@gmail.com';

export const INITIAL_PERMISSION_LIST: Permission[] = [
  { email: PERMANENT_ADMIN_EMAIL, isAdmin: true },
  { email: 'admin@example.com', isAdmin: true },
  { email: 'devops-engineer@example.com' },
  { email: 'student@example.com' }
];

// The initial list is now empty. All content will be managed from the admin dashboard.
export const DRIVE_CONTENT: Content[] = [];

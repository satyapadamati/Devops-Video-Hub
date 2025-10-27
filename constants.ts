import { Content } from './types';

export const PERMANENT_ADMIN_EMAIL = 'satyapadamati5@gmail.com';

export const INITIAL_PERMISSION_LIST: string[] = [
  PERMANENT_ADMIN_EMAIL,
  'admin@example.com',
  'devops-engineer@example.com',
  'student@example.com'
];

// The initial list is now empty. All content will be managed from the admin dashboard.
export const DRIVE_CONTENT: Content[] = [];
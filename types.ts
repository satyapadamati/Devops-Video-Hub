
// FIX: Added missing User interface to resolve import error.
export interface User {
  email: string;
}

export interface Permission {
  email: string;
  isAdmin?: boolean;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  driveFileId: string;
  type: 'video' | 'document' | 'folder';
  duration: string;
  series?: string;
}
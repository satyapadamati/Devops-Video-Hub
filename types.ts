
export interface User {
  email: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  driveFileId: string;
  type: 'video' | 'document' | 'folder';
  duration: string;
}
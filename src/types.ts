export interface FileEntry {
  name: string;
  kind: 'file' | 'directory';
  path: string;
}

export interface OpfsResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export type OpfsMessage =
  | { type: 'OPFS_List'; path: string }
  | { type: 'OPFS_Read'; path: string }
  | { type: 'OPFS_Write'; path: string; content: string; isBinary: boolean }
  | { type: 'OPFS_Rename'; path: string; newPath: string }
  | { type: 'OPFS_Move'; oldPath: string; newPath: string }
  | { type: 'OPFS_Create'; path: string; kind: 'file' | 'directory' }
  | { type: 'OPFS_Delete'; path: string }
  | { type: 'OPFS_Download'; path: string };

export {};

declare global {
  interface FileSystemHandle {
    move(newName: string): Promise<void>;
    move(dir: FileSystemDirectoryHandle, newName: string): Promise<void>;
  }
}

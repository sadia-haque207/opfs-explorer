
import type { FileEntry, OpfsMessage, OpfsResponse } from '../types';
export type { FileEntry, OpfsMessage, OpfsResponse };

export const opfsApi = {
  list: (path: string): Promise<FileEntry[]> => sendMessage({ type: 'OPFS_List', path }),
  read: (path: string): Promise<string> => sendMessage({ type: 'OPFS_Read', path }),
  write: (path: string, content: string, isBinary: boolean = false): Promise<void> => sendMessage({ type: 'OPFS_Write', path, content, isBinary }),
  rename: (path: string, newPath: string): Promise<void> => sendMessage({ type: 'OPFS_Rename', path, newPath }),
  move: (oldPath: string, newPath: string): Promise<void> => sendMessage({ type: 'OPFS_Move', oldPath, newPath }),
  create: (path: string, kind: 'file' | 'directory'): Promise<void> => sendMessage({ type: 'OPFS_Create', path, kind }),
  delete: (path: string): Promise<void> => sendMessage({ type: 'OPFS_Delete', path }),
  download: (path: string): Promise<void> => sendMessage({ type: 'OPFS_Download', path }),
};

function sendMessage<T>(message: OpfsMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!chrome?.devtools) {
        // Mock for local dev
        console.log(`[Mock] ${message.type}`, message);
        if (message.type === 'OPFS_List') {
             // ... existing mock ...
             if (message.path === "") return resolve([
                { name: 'folder1', kind: 'directory', path: 'folder1' },
                { name: 'file1.txt', kind: 'file', path: 'file1.txt' }
            ] as unknown as T);
             return resolve([] as unknown as T);
        }
        if (message.type === 'OPFS_Read') return resolve(`Content of ${message.path}` as unknown as T);
        if (message.type === 'OPFS_Move') return resolve(undefined as unknown as T);
        if (message.type === 'OPFS_Download') return resolve(undefined as unknown as T);
        return resolve(undefined as unknown as T);
    }

    const tabId = chrome.devtools.inspectedWindow.tabId;
    chrome.tabs.sendMessage(tabId, message, (response: OpfsResponse<T>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (response && response.success) {
        resolve(response.data as T);
      } else {
        reject(new Error(response?.error || 'Unknown error'));
      }
    });
  });
}

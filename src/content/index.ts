import type { OpfsMessage, FileEntry } from '../types';

// Content script that bridges the DevTools panel and the page's OPFS

console.log('OPFS Explorer Content Script Loaded');

chrome.runtime.onMessage.addListener((request: OpfsMessage, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  const handleRequest = async () => {
    try {
      // Environment Checks
      if (!isSecureContext) {
        throw new Error("OPFS requires a Secure Context (HTTPS or localhost).");
      }
      if (!navigator.storage || !navigator.storage.getDirectory) {
        throw new Error("OPFS API (navigator.storage.getDirectory) is not supported in this browser/context.");
      }

      switch (request.type) {
        case 'OPFS_List': {
          const files = await listOPFS(request.path);
          sendResponse({ success: true, data: files });
          break;
        }
        case 'OPFS_Read': {
          const content = await readFileOPFS(request.path);
          sendResponse({ success: true, data: content });
          break;
        }
        case 'OPFS_Write': {
          await writeFileOPFS(request.path, request.content, request.isBinary);
          sendResponse({ success: true });
          break;
        }
        case 'OPFS_Rename': {
          await renameOPFS(request.path, request.newPath);
          sendResponse({ success: true });
          break;
        }
        case 'OPFS_Move': {
          await moveOPFS(request.oldPath, request.newPath);
          sendResponse({ success: true });
          break;
        }
        case 'OPFS_Create': {
          if (request.kind === 'directory') {
             await createDirectoryOPFS(request.path);
          } else {
             await createFileOPFS(request.path);
          }
          sendResponse({ success: true });
          break;
        }
        case 'OPFS_Delete': {
          await deleteOPFS(request.path);
          sendResponse({ success: true });
          break;
        }
        case 'OPFS_Download': {
          await downloadOPFS(request.path);
          sendResponse({ success: true });
          break;
        }
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sendResponse({ success: false, error: `Unknown command: ${(request as any).type}` });
      }
    } catch (err: any) {
      console.error("OPFS Explorer Error:", err);
      sendResponse({ success: false, error: err.message });
    }
  };

  handleRequest();
  return true; // Async response
});

// Helper to resolve a path string (e.g., "folder/subfolder") to a DirectoryHandle
async function resolvePath(path: string): Promise<FileSystemDirectoryHandle> {
  let root = await navigator.storage.getDirectory();
  if (!path || path === '') return root;

  const parts = path.split('/').filter(p => p.length > 0);
  let current = root;
  for (const part of parts) {
    current = await current.getDirectoryHandle(part);
  }
  return current;
}

async function listOPFS(path = ''): Promise<FileEntry[]> {
  try {
    const dirHandle = await resolvePath(path);
    const files: FileEntry[] = [];
    // @ts-ignore - iterating over async iterator
    for await (const [name, handle] of dirHandle.entries()) {
        files.push({
            name,
            kind: handle.kind,
            path: path ? `${path}/${name}` : name
        });
    }
    return files.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? -1 : 1;
    });
  } catch (e) {
    console.error("Failed to list path:", path, e);
    throw new Error(`Could not list directory: ${path}`);
  }
}

async function readFileOPFS(path: string) {
  if (!path) throw new Error("File path required");
  const parts = path.split('/');
  const fileName = parts.pop();
  const dirPath = parts.join('/');
  
  const dirHandle = await resolvePath(dirPath);
  if (!fileName) throw new Error("Invalid file path");

  const fileHandle = await dirHandle.getFileHandle(fileName);
  const file = await fileHandle.getFile();
  
  // Check size (Limit to 1MB for text preview)
  if (file.size > 1024 * 1024) {
      return `[BINARY_OR_LARGE] File is too large to preview (${(file.size / 1024 / 1024).toFixed(2)} MB). Please download to view.`;
  }

  // Check if text or binary
  if (file.type.startsWith('text/') || file.type === '' || file.type === 'application/json' || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.js') || file.name.endsWith('.css') || file.name.endsWith('.html') || file.name.endsWith('.md') || file.name.endsWith('.xml')) {
      return await file.text();
  }
  else {
      return `[BINARY_OR_LARGE] Type: ${file.type}, Size: ${file.size} bytes.`;
  }
}


async function writeFileOPFS(path: string, content: string, isBinary: boolean = false) {
  if (!path) throw new Error("Path required");
  const parts = path.split('/');
  const fileName = parts.pop();
  const dirPath = parts.join('/');
  
  const dirHandle = await resolvePath(dirPath);
  if (!fileName) throw new Error("Invalid file path");

  const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  
  if (isBinary) {
      // Convert base64 to Uint8Array
      const binaryString = atob(content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      await writable.write(bytes);
  } else {
      await writable.write(content);
  }
  
  await writable.close();
}

async function renameOPFS(oldPath: string, newName: string) {
  // Simple rename in same directory
  if (!oldPath || !newName) throw new Error("Path and new name required");
  
  const parts = oldPath.split('/');
  const oldName = parts.pop();
  const dirPath = parts.join('/');
  
  const dirHandle = await resolvePath(dirPath);
  if (!oldName) throw new Error("Invalid path");

  let handle: FileSystemHandle;
  try {
      handle = await dirHandle.getFileHandle(oldName);
  } catch {
      handle = await dirHandle.getDirectoryHandle(oldName);
  }

  if ('move' in handle) {
      await handle.move(newName);
  } else {
      throw new Error("Rename (move) not supported in this browser version.");
  }
}

async function moveOPFS(oldPath: string, newPath: string) {
    if (!oldPath || !newPath) throw new Error("Old path and new path required");

    // Resolve Source Handle
    const oldParts = oldPath.split('/');
    const oldName = oldParts.pop();
    const oldDirPath = oldParts.join('/');
    const oldDirHandle = await resolvePath(oldDirPath);
    
    if (!oldName) throw new Error("Invalid old path");

    let handle: FileSystemHandle;
    try {
        handle = await oldDirHandle.getFileHandle(oldName);
    } catch {
        handle = await oldDirHandle.getDirectoryHandle(oldName);
    }

    // Resolve Destination Directory
    const newParts = newPath.split('/');
    const newName = newParts.pop();
    const newDirPath = newParts.join('/');
    const newDirHandle = await resolvePath(newDirPath);

    if (!newName) throw new Error("Invalid new path");

    if ('move' in handle) {
         await handle.move(newDirHandle, newName);
    } else {
        throw new Error("Move API not supported.");
    }
}

async function createDirectoryOPFS(path: string) {
    // Path includes the new folder name
    // e.g. "folder/newFolder"
    const parts = path.split('/');
    const newFolderName = parts.pop();
    const dirPath = parts.join('/');
    
    const dirHandle = await resolvePath(dirPath);
    if (!newFolderName) throw new Error("Invalid path");
    await dirHandle.getDirectoryHandle(newFolderName, { create: true });
}

async function createFileOPFS(path: string) {
    const parts = path.split('/');
    const newFileName = parts.pop();
    const dirPath = parts.join('/');
    
    const dirHandle = await resolvePath(dirPath);
    if (!newFileName) throw new Error("Invalid path");
    await dirHandle.getFileHandle(newFileName, { create: true });
}

async function deleteOPFS(path: string) {
   if (!path) throw new Error("Path required");
   const parts = path.split('/');
   const name = parts.pop();
   const dirPath = parts.join('/');
   
   const dirHandle = await resolvePath(dirPath);
   if (!name) throw new Error("Invalid path");
   
   await dirHandle.removeEntry(name, { recursive: true });
}

async function downloadOPFS(path: string) {
    if (!path) throw new Error("Path required");
    const parts = path.split('/');
    const fileName = parts.pop();
    const dirPath = parts.join('/');
    
    const dirHandle = await resolvePath(dirPath);
    if (!fileName) throw new Error("Invalid file path");
  
    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
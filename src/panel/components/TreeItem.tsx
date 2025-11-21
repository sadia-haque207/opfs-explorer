import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FileJson, FileCode, FileText, Image } from 'lucide-react';
import { opfsApi } from '../api';
import type { FileEntry } from '../api';

interface TreeItemProps {
  entry: FileEntry;
  depth?: number;
  onSelect: (entry: FileEntry) => void;
  selectedPath: string | null;
  onContextMenu: (e: React.MouseEvent, entry: FileEntry) => void;
  onDrop?: (e: React.DragEvent, targetEntry: FileEntry) => void;
  onDragStart?: (e: React.DragEvent, entry: FileEntry) => void;
  refreshTrigger?: number;
}

export function TreeItem({ entry, depth = 0, onSelect, selectedPath, onContextMenu, onDrop, onDragStart, refreshTrigger }: TreeItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isSelected = selectedPath === entry.path;
  const paddingLeft = `${depth * 12 + 4}px`;

  const fetchChildren = useCallback(async () => {
      setLoading(true);
      try {
        const files = await opfsApi.list(entry.path);
        setChildren(files);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
  }, [entry.path]);

  useEffect(() => {
      if (expanded) {
          fetchChildren();
      }
  }, [expanded, refreshTrigger, fetchChildren]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(entry); // Also select on toggle click

    if (entry.kind === 'file') {
        return;
    }

    setExpanded(prev => !prev);
  };

  const handleRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(entry); // Auto select on right click
      onContextMenu(e, entry);
  };

  const handleDragStart = (e: React.DragEvent) => {
      e.stopPropagation();
      e.dataTransfer.setData('application/opfs-path', entry.path);
      e.dataTransfer.effectAllowed = 'move';
      if (onDragStart) onDragStart(e, entry);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (entry.kind === 'directory') {
          setIsDragOver(true);
          e.dataTransfer.dropEffect = e.dataTransfer.types.includes('application/opfs-path') ? 'move' : 'copy';
      }
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (onDrop && entry.kind === 'directory') {
          onDrop(e, entry);
      }
  };

  const getIcon = () => {
    if (entry.kind === 'directory') {
        if (expanded) return <Folder size={14} className="text-dt-text-secondary fill-blue-400/20" />;
        return <Folder size={14} className="text-dt-text-secondary" />;
    }
    if (entry.name.endsWith('.json')) return <FileJson size={14} className="text-yellow-400" />;
    if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) return <FileCode size={14} className="text-blue-400" />;
    if (entry.name.match(/\.(jpg|png|gif|svg)$/)) return <Image size={14} className="text-purple-400" />;
    return <FileText size={14} className="text-gray-400" />;
  };

  return (
    <div>
      <div 
        draggable
        onDragStart={handleDragStart}
        className={`
            flex items-center py-0.5 pr-2 cursor-default select-none group
            ${isSelected ? 'bg-dt-selection text-dt-selection-text' : ''}
            ${!isSelected && !isDragOver ? 'hover:bg-dt-hover text-dt-text' : ''}
            ${isDragOver ? 'bg-blue-500/30 ring-1 ring-inset ring-blue-500 text-dt-text' : ''}
        `}
        style={{ paddingLeft }}
        onClick={handleToggle}
        onContextMenu={handleRightClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="mr-1 w-4 flex justify-center shrink-0">
          {entry.kind === 'directory' && (
            <button className="focus:outline-none text-dt-text-secondary hover:text-dt-text">
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
        </span>
        
        <span className="mr-1.5 shrink-0">
            {getIcon()}
        </span>
        
        <span className="truncate text-[11px] leading-tight">{entry.name}</span>
      </div>

      {error && expanded && (
          <div className="ml-8 text-red-500 text-[10px]">{error}</div>
      )}

      {expanded && (
        <div>
          {loading ? (
             <div className="pl-8 text-gray-400 italic text-[10px]">Loading...</div>
          ) : (
            children.map(child => (
              <TreeItem 
                key={child.path} 
                entry={child} 
                depth={depth + 1} 
                onSelect={onSelect}
                selectedPath={selectedPath}
                onContextMenu={onContextMenu}
                onDrop={onDrop}
                onDragStart={onDragStart}
                refreshTrigger={refreshTrigger}
              />
            ))
          )}
          {children.length === 0 && !loading && (
              <div className="pl-8 text-gray-400 italic text-[10px] py-1">Empty</div>
          )}
        </div>
      )}
    </div>
  );
}

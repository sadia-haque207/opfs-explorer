import { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  items: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
  }[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if it goes off screen (basic)
  const style = {
      top: y,
      left: x,
  };

  return (
    <div 
      ref={ref}
      className="fixed z-50 bg-dt-surface border border-dt-border shadow-lg rounded min-w-[150px] py-1"
      style={style}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`
            w-full text-left px-4 py-1 text-xs hover:bg-dt-hover
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${item.danger ? 'text-red-400' : 'text-dt-text'}
          `}
          onClick={() => {
              if (!item.disabled) {
                  item.onClick();
                  onClose();
              }
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

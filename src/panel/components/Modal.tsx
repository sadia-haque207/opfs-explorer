import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  inputValue?: string;
  placeholder?: string;
  type: 'alert' | 'confirm' | 'prompt';
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

export function Modal({ isOpen, title, message, inputValue = '', placeholder, type, onConfirm, onCancel }: ModalProps) {
  const [value, setValue] = useState(inputValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(inputValue);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, inputValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleConfirm();
      if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
      <div className="bg-dt-surface border border-dt-border shadow-xl rounded-lg w-[320px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-dt-border bg-dt-bg">
          <h3 className="font-semibold text-dt-text text-sm">{title}</h3>
          <button onClick={onCancel} className="text-dt-text-secondary hover:text-dt-text">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {message && <p className="text-dt-text text-xs mb-3">{message}</p>}
          
          {type === 'prompt' && (
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-dt-bg border border-dt-border rounded px-2 py-1 text-xs text-dt-text focus:border-blue-500 focus:outline-none"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-2 space-x-2 bg-dt-bg border-t border-dt-border">
          {type !== 'alert' && (
            <button 
                onClick={onCancel} 
                className="px-3 py-1 rounded text-xs text-dt-text border border-dt-border hover:bg-dt-hover"
            >
                Cancel
            </button>
          )}
          <button 
            onClick={handleConfirm}
            className="px-3 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-500"
          >
            {type === 'alert' ? 'OK' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

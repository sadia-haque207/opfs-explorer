import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-8 right-4 z-[200] flex flex-col space-y-2 pointer-events-none">
        {toasts.map(toast => (
            <div 
                key={toast.id} 
                className="pointer-events-auto flex items-center w-64 bg-dt-surface border border-dt-border shadow-lg rounded p-2 animate-in slide-in-from-right-full duration-200"
            >
                <div className="mr-2">
                    {toast.type === 'success' && <CheckCircle size={16} className="text-green-500" />}
                    {toast.type === 'error' && <AlertCircle size={16} className="text-red-500" />}
                    {toast.type === 'info' && <Info size={16} className="text-blue-500" />}
                </div>
                <span className="text-xs text-dt-text flex-1 break-words">{toast.message}</span>
                <button onClick={() => onDismiss(toast.id)} className="ml-2 text-dt-text-secondary hover:text-dt-text">
                    <X size={14} />
                </button>
            </div>
        ))}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, toast.duration || 5000);
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
    success: (message: string, duration?: number) => useToastStore.getState().addToast({ type: 'success', message, duration }),
    error: (message: string, duration?: number) => useToastStore.getState().addToast({ type: 'error', message, duration }),
    info: (message: string, duration?: number) => useToastStore.getState().addToast({ type: 'info', message, duration }),
};

const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
};

const colors = {
    success: 'bg-[#10B981] text-white',
    error: 'bg-[#EF4444] text-white',
    info: 'bg-[#3B82F6] text-white',
};

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => {
                    const Icon = icons[toast.type];
                    return (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.95 }}
                            className={`${colors[toast.type]} px-4 py-3 rounded-[12px] shadow-lg flex items-center gap-3 min-w-[320px] max-w-md pointer-events-auto`}
                        >
                            <Icon size={20} />
                            <p className="flex-1 text-sm font-medium font-[Lexend]">{toast.message}</p>
                            <button onClick={() => removeToast(toast.id)} className="hover:opacity-80">
                                <X size={18} />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

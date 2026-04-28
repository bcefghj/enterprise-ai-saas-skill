"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const variantConfig: Record<
  ToastVariant,
  { icon: React.ElementType; className: string }
> = {
  success: {
    icon: CheckCircle,
    className:
      "border-emerald-500/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-500/20",
  },
  error: {
    icon: AlertCircle,
    className:
      "border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/80 dark:text-red-100 dark:border-red-500/20",
  },
  info: {
    icon: Info,
    className:
      "border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/80 dark:text-blue-100 dark:border-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-yellow-500/30 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/80 dark:text-yellow-100 dark:border-yellow-500/20",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "pointer-events-auto flex w-80 items-center gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        config.className
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

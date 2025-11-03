"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "./use-toast";

export function ToasterViewport() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex flex-col gap-3 sm:inset-x-auto sm:right-6 sm:w-[340px]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "pointer-events-auto rounded-xl border bg-popover/95 p-4 text-sm shadow-lg backdrop-blur",
              toast.variant === "destructive" && "border-destructive/50 bg-destructive/10 text-destructive"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                {toast.title && <p className="font-medium">{toast.title}</p>}
                {toast.description && <p className="mt-1 text-muted-foreground">{toast.description}</p>}
              </div>
              <button
                onClick={() => dismiss(toast.id)}
                className="rounded-full p-1 text-xs text-muted-foreground hover:bg-muted/40"
              >
                ✕
              </button>
            </div>
            {toast.action && <div className="mt-3">{toast.action}</div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

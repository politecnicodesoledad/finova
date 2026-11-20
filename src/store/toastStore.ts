import { create } from "zustand";

export type ToastType = "success" | "gold" | "info" | "warn";

export interface ToastItem {
  id: number;
  title: string;
  message: string;
  type: ToastType;
  leaving: boolean;
}

interface ToastStore {
  toasts: ToastItem[];
}

let seq = 0;
export const useToastStore = create<ToastStore>(() => ({ toasts: [] }));

export function showToast(title: string, message = "", type: ToastType = "success") {
  const id = ++seq;
  useToastStore.setState((s) => ({ toasts: [...s.toasts, { id, title, message, type, leaving: false }] }));
  setTimeout(() => {
    useToastStore.setState((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
    setTimeout(() => {
      useToastStore.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 260);
  }, 3400);
}

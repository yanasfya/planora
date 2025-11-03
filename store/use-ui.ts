"use client";

import { create } from "zustand";

interface UIState {
  isSidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (value) => set({ isSidebarOpen: value })
}));

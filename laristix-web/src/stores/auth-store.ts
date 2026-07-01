import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthenticatedUser } from "@/types/auth";

interface AuthState {
  user: AuthenticatedUser | null;
  isHydrated: boolean;
  setUser: (user: AuthenticatedUser | null) => void;
  setHydrated: (value: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      setHydrated: (value) => set({ isHydrated: value }),
      clear: () => set({ user: null }),
    }),
    {
      name: "laristix-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

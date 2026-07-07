import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProfileMode = "customer" | "creator";

interface ProfileModeState {
  profileMode: ProfileMode;
  setProfileMode: (mode: ProfileMode) => void;
  clear: () => void;
}

export const useProfileModeStore = create<ProfileModeState>()(
  persist(
    (set) => ({
      profileMode: "customer",
      setProfileMode: (mode) => set({ profileMode: mode }),
      clear: () => set({ profileMode: "customer" }),
    }),
    { name: "laristix-profile-mode" },
  ),
);

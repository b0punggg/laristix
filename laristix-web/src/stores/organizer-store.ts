import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrganizerState {
  activeOrganizerId: number | null;
  setActiveOrganizerId: (id: number | null) => void;
  clear: () => void;
}

export const useOrganizerStore = create<OrganizerState>()(
  persist(
    (set) => ({
      activeOrganizerId: null,
      setActiveOrganizerId: (id) => set({ activeOrganizerId: id }),
      clear: () => set({ activeOrganizerId: null }),
    }),
    { name: "laristix-organizer" },
  ),
);

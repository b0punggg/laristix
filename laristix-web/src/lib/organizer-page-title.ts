import { routes } from "@/config/env";

const pageTitles: Array<{ match: (path: string) => boolean; title: string }> = [
  { match: (p) => p === routes.organizerDashboard, title: "Dashboard" },
  { match: (p) => p.startsWith(routes.organizerAnalytics), title: "Analitik" },
  { match: (p) => p.startsWith(routes.organizerTeam), title: "Tim" },
  { match: (p) => p.startsWith(routes.organizerEvents), title: "Event" },
  { match: (p) => p.startsWith(routes.scanner), title: "Scanner" },
  { match: (p) => p === routes.selectOrganizer, title: "Pilih Organizer" },
];

export function getOrganizerPageTitle(pathname: string): string {
  const match = pageTitles.find((item) => item.match(pathname));
  return match?.title ?? "Organizer";
}

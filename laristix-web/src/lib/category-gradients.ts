const categoryGradientMap: Record<string, string> = {
  konser: "from-violet-600/90 via-purple-700/80 to-indigo-900/70",
  festival: "from-orange-500/90 via-amber-600/80 to-red-700/70",
  workshop: "from-sky-500/90 via-blue-600/80 to-indigo-800/70",
  seminar: "from-teal-500/90 via-cyan-600/80 to-blue-800/70",
  olahraga: "from-emerald-500/90 via-green-600/80 to-teal-800/70",
  komunitas: "from-pink-500/90 via-rose-600/80 to-red-800/70",
  teknologi: "from-slate-600/90 via-slate-700/80 to-slate-900/70",
  seni: "from-fuchsia-500/90 via-purple-600/80 to-violet-900/70",
};

const defaultGradient = "from-primary/80 via-primary/60 to-primary/40";

export function getCategoryGradient(slug: string | null | undefined): string {
  if (!slug) {
    return defaultGradient;
  }

  return categoryGradientMap[slug] ?? defaultGradient;
}

/** Lucide icon size tokens (px) */
export const iconSizes = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof iconSizes;

export const iconSizeClasses: Record<IconSize, string> = {
  xs: "size-4",
  sm: "size-[18px]",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

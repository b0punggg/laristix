/** Semantic color token names — values live in globals.css as CSS variables */
export const colorTokens = {
  brand: {
    DEFAULT: "hsl(var(--brand))",
    hover: "hsl(var(--brand-hover))",
    active: "hsl(var(--brand-active))",
    foreground: "hsl(var(--brand-foreground))",
    muted: "hsl(var(--brand-muted))",
  },
  primary: {
    DEFAULT: "hsl(var(--primary))",
    hover: "hsl(var(--primary-hover))",
    active: "hsl(var(--primary-active))",
    foreground: "hsl(var(--primary-foreground))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    hover: "hsl(var(--secondary-hover))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  success: {
    DEFAULT: "hsl(var(--success))",
    hover: "hsl(var(--success-hover))",
    foreground: "hsl(var(--success-foreground))",
    muted: "hsl(var(--success-muted))",
  },
  warning: {
    DEFAULT: "hsl(var(--warning))",
    hover: "hsl(var(--warning-hover))",
    foreground: "hsl(var(--warning-foreground))",
    muted: "hsl(var(--warning-muted))",
  },
  danger: {
    DEFAULT: "hsl(var(--danger))",
    hover: "hsl(var(--danger-hover))",
    foreground: "hsl(var(--danger-foreground))",
    muted: "hsl(var(--danger-muted))",
  },
  info: {
    DEFAULT: "hsl(var(--info))",
    hover: "hsl(var(--info-hover))",
    foreground: "hsl(var(--info-foreground))",
    muted: "hsl(var(--info-muted))",
  },
  background: "hsl(var(--background))",
  surface: {
    DEFAULT: "hsl(var(--surface))",
    raised: "hsl(var(--surface-raised))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  border: {
    DEFAULT: "hsl(var(--border))",
    strong: "hsl(var(--border-strong))",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  text: {
    primary: "hsl(var(--text-primary))",
    secondary: "hsl(var(--text-secondary))",
    disabled: "hsl(var(--text-disabled))",
  },
  disabled: "hsl(var(--disabled))",
} as const;

export const radiusTokens = {
  xs: "var(--radius-xs)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  full: "var(--radius-full)",
} as const;

export const shadowTokens = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
} as const;

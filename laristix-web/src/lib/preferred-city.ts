const STORAGE_KEY = "laristix_preferred_city";

export function getPreferredCity(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY)?.trim();

  return value || null;
}

export function setPreferredCity(city: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, city);
}

export function clearPreferredCity(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { useOrganizerStore } from "@/stores/organizer-store";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));

  return match ? decodeURIComponent(match[1]) : null;
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const xsrfToken = readCookie("XSRF-TOKEN");

  if (xsrfToken) {
    config.headers.set("X-XSRF-TOKEN", xsrfToken);
  }

  const organizerId = useOrganizerStore.getState().activeOrganizerId;

  if (organizerId) {
    config.headers.set("X-Organizer-Id", String(organizerId));
  }

  return config;
});

function simplifyApiMessage(message: string): string {
  if (message.includes("Access denied due to unauthorized transaction")) {
    return "Midtrans menolak request. Periksa Server Key, Client Key, dan setting sandbox/production di .env.";
  }

  if (message.includes("Midtrans server key is not configured")) {
    return "Server Key Midtrans belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY di .env lalu jalankan php artisan config:clear.";
  }

  if (message.includes("Cannot reach Midtrans") || message.includes("Connection timed out")) {
    return "Tidak dapat terhubung ke Midtrans. Periksa koneksi internet Anda lalu coba lagi.";
  }

  const jsonStart = message.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(message.slice(jsonStart)) as { error_messages?: string[] };
      if (parsed.error_messages?.[0]) {
        return parsed.error_messages[0];
      }
    } catch {
      // keep original message
    }
  }

  return message.length > 240 ? `${message.slice(0, 240)}…` : message;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "Request timeout. Silakan coba lagi.";
    }

    return "Tidak dapat terhubung ke server. Pastikan Laragon/backend berjalan.";
  }

  if (error.response.status === 419) {
    return "Sesi kedaluwarsa. Muat ulang halaman lalu coba lagi.";
  }

  const data = error.response.data as { message?: string; errors?: Record<string, string[]> } | undefined;

  if (typeof data === "object" && data !== null) {
    if (data.errors) {
      const firstField = Object.values(data.errors)[0];
      if (firstField?.[0]) {
        return firstField[0];
      }
    }

    if (typeof data.message === "string" && data.message.length > 0) {
      return simplifyApiMessage(data.message);
    }
  }

  return fallback;
}

export async function ensureCsrfCookie(): Promise<void> {
  await apiClient.get("/sanctum/csrf-cookie");

  const token = readCookie("XSRF-TOKEN");

  if (token) {
    apiClient.defaults.headers.common["X-XSRF-TOKEN"] = token;
  }
}

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://laristix.test";
const backendOrigin = new URL(BACKEND_URL);

const hopByHopHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
]);

function rewriteSetCookie(value: string): string {
  return value.replace(/;\s*Domain=[^;]*/gi, "");
}

function buildBackendUrl(prefix: string, pathSegments: string[], search: string): string {
  const path = pathSegments.join("/");
  const base = `${BACKEND_URL}${prefix}${path}`;
  return search ? `${base}${search}` : base;
}

export async function proxyToBackend(
  request: NextRequest,
  prefix: string,
  pathSegments: string[],
): Promise<NextResponse> {
  const url = buildBackendUrl(prefix, pathSegments, request.nextUrl.search);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      hopByHopHeaders.has(lower) ||
      lower === "host" ||
      lower === "x-forwarded-host" ||
      lower === "x-forwarded-proto"
    ) {
      return;
    }
    headers.set(key, value);
  });

  // Signed Laravel URLs are generated for APP_URL (e.g. laristix.test).
  // Forward the backend host so signature validation succeeds through the proxy.
  headers.set("X-Forwarded-Host", backendOrigin.host);
  headers.set("X-Forwarded-Proto", backendOrigin.protocol.replace(":", ""));
  headers.set("X-Forwarded-For", request.headers.get("x-forwarded-for") ?? "127.0.0.1");

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
    init.duplex = "half";
  }

  const backendResponse = await fetch(url, init);
  const responseHeaders = new Headers();

  backendResponse.headers.forEach((value, key) => {
    const lower = key.toLowerCase();

    if (hopByHopHeaders.has(lower) || lower === "set-cookie") {
      return;
    }

    responseHeaders.set(key, value);
  });

  const setCookies =
    typeof backendResponse.headers.getSetCookie === "function"
      ? backendResponse.headers.getSetCookie()
      : [backendResponse.headers.get("set-cookie")].filter(Boolean) as string[];

  for (const cookie of setCookies) {
    responseHeaders.append("set-cookie", rewriteSetCookie(cookie));
  }

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

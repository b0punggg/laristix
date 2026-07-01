import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/backend-proxy";

type RouteContext = {
  params: { path: string[] };
};

async function handler(request: NextRequest, context: RouteContext) {
  return proxyToBackend(request, "/sanctum/", context.params.path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;

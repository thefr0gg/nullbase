import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safe, local echo endpoint that powers the HTTP playground components.
 * Reflects the method, URL, headers and (for non-GET) the body back as JSON.
 */
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;

async function handle(req: NextRequest) {
  const bodyText = await req.text();
  return NextResponse.json(
    {
      method: req.method,
      url: req.url,
      path: req.nextUrl.pathname,
      search: req.nextUrl.search,
      headers: Object.fromEntries(req.headers.entries()),
      body: bodyText || undefined,
      receivedAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}

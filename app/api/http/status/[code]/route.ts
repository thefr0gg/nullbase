import { NextResponse } from "next/server";
import { STATUS_CODES } from "node:http";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Returns a real response carrying the requested status code. Used by the
 * `<StatusCodeExplorer />` playground. `GET /api/http/status/200..599`.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  void _req;
  const { code } = await context.params;
  const n = Number(code);
  if (!Number.isInteger(n) || n < 100 || n > 599) {
    return NextResponse.json(
      { error: `Invalid status code: ${code}` },
      { status: 400 },
    );
  }
  return NextResponse.json(
    {
      status: n,
      reason: STATUS_CODES[n] ?? "Unknown",
      message: `This is a simulated ${n} response from nullbase.`,
    },
    { status: n },
  );
}

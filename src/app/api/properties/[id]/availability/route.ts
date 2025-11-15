import { NextResponse } from "next/server";
import { getAvailabilityForMonth } from "@/app/api/_data";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  if (!id || !month) {
    return NextResponse.json({ error: "Missing id or month" }, { status: 400 });
  }
  const data = getAvailabilityForMonth(id, month);
  return NextResponse.json(data);
}
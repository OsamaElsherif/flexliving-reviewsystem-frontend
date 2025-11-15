import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/properties`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Backend error: ${res.status}` }, { status: 502 });
    }
    const json = await res.json();
    const items = (json?.data ?? []).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      avgRating: Number(p.averageRating ?? 0),
      totalReviews: Number(p.reviewCount ?? 0),
    }));
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to load properties" }, { status: 500 });
  }
}
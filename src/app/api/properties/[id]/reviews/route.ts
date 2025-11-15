import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
export const dynamic = "force-dynamic";

function slugify(name: string): string {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mapChannelFromType(type: any): string {
  const s = String(type || "").toLowerCase();
  // We don't have exact channel, but if type is host-to-guest, treat as Hostaway for demo
  if (s.includes("host")) return "Hostaway";
  return "Hostaway"; // default
}

function mapCategories(cats: any[]): Record<string, number> | undefined {
  if (!Array.isArray(cats)) return undefined;
  const out: Record<string, number> = {};
  for (const c of cats) {
    const name = String(c?.category || "").toLowerCase();
    const val = typeof c?.rating === "number" ? c.rating : undefined;
    if (val === undefined) continue;
    if (["cleanliness", "communication", "value", "location", "respect_house_rules"].includes(name)) {
      // map 0-10 to 0-5 for UI consistency
      out[name === "respect_house_rules" ? "value" : name] = Number(((val > 5 ? val / 2 : val)).toFixed(2));
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing property id" }, { status: 400 });
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/properties/${id}/reviews`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Backend error: ${res.status}` }, { status: 502 });
    }
    const json = await res.json();
    const items = Array.isArray(json?.data) ? json.data : [];
    const mapped = items.map((r: any) => ({
      id: String(r.id),
      propertyId: id,
      guestName: r.guestName ?? "",
      rating: typeof r.rating === "number" ? (r.rating > 5 ? r.rating / 2 : r.rating) : 0,
      date: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date(0).toISOString(),
      channel: mapChannelFromType(r.type),
      approved: r.approved,
      text: r.publicReview ?? "",
      categories: mapCategories(r.reviewCategory),
    }));
    console.log(mapped);
    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to load property reviews" }, { status: 500 });
  }
}
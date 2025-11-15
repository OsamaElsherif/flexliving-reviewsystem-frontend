import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
export const dynamic = "force-dynamic";

function mapChannelFromType(type: any): string {
  const s = String(type || "").toLowerCase();
  if (s.includes("host")) return "Hostaway";
  return "Hostaway";
}

function mapCategories(cats: any[]): Record<string, number> | undefined {
  if (!Array.isArray(cats)) return undefined;
  const out: Record<string, number> = {};
  for (const c of cats) {
    const name = String(c?.name || c?.category || "").toLowerCase();
    const val = typeof c?.rating === "number" ? c.rating : undefined;
    if (val === undefined) continue;
    if (["cleanliness", "communication", "value", "location"].includes(name)) {
      out[name] = Number(((val > 5 ? val / 2 : val)).toFixed(2));
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // property id (numeric from DB)
  if (!id) {
    return NextResponse.json({ error: "Missing property id" }, { status: 400 });
  }
  try {
    // Fetch property details to get its listings/name to match Hostaway mockup listingName
    const propRes = await fetch(`${BACKEND_URL}/api/properties/${id}`, { cache: "no-store" });
    if (!propRes.ok) {
      return NextResponse.json({ error: `Backend error: ${propRes.status}` }, { status: 502 });
    }
    const propJson = await propRes.json();
    const prop = propJson?.data ?? {};
    const listingKey = String(prop?.listings || prop?.name || "");
    if (!listingKey) {
      return NextResponse.json([], { status: 200 });
    }
    
    // Load Hostaway mockup reviews
    const res = await fetch(`${BACKEND_URL}/api/reviews/hostway`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Backend error: ${res.status}` }, { status: 502 });
    }
    const json = await res.json();
    const items = Array.isArray(json?.result) ? json.result : [];
    
    // Filter to only this property's reviews by exact listingName match
    const filtered = items.filter((it: any) => String(it?.listingName || "") === listingKey);

    // Map to dashboard expected shape
    const mapped = filtered.map((r: any) => ({
      id: String(r.id),
      hostwayId: String(r.id), // hostaway id
      propertyId: id,
      guestName: r.guestName ?? "",
      rating: typeof r.rating === "number" ? Number(((r.rating > 5 ? r.rating / 2 : r.rating)).toFixed(2)) : 0,
      date: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date(0).toISOString(),
      channel: mapChannelFromType(r.type),
      approved: r.status === "published",
      text: r.publicReview ?? "",
      categories: mapCategories(r.reviewCategory),
    }));
    
    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to load dashboard property reviews" }, { status: 500 });
  }
}
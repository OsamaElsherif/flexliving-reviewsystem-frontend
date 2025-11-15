import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

function mapChannel(ch: any): string {
  const s = String(ch || "").toLowerCase();
  if (s === "hostaway") return "Hostaway";
  if (s === "airbnb") return "Airbnb";
  if (s === "booking") return "Booking";
  if (s === "google") return "Google";
  return s ? s[0].toUpperCase() + s.slice(1) : "";
}

function mapCategories(cats: any[]): Record<string, number> | undefined {
  if (!Array.isArray(cats)) return undefined;
  const out: Record<string, number> = {};
  for (const c of cats) {
    const name = String(c?.name || "").toLowerCase();
    const val = typeof c?.rating === "number" ? c.rating : undefined;
    if (val === undefined) continue;
    if (["cleanliness", "communication", "value", "location"].includes(name)) {
      out[name] = val;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { approved } = body as { approved: boolean };
  try {
    const res = await fetch(`${BACKEND_URL}/api/reviews/hostway/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve: approved }), // backend expects `approve`
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Backend error: ${res.status}` }, { status: 502 });
    }
    const json = await res.json();
    const r = json?.data ?? {};
    const mapped = {
      id: String(r.id),
      propertyId: r.propertyId ? String(r.propertyId) : "",
      guestName: r.guestName ?? "",
      rating: typeof r.rating === "number" ? r.rating : 0,
      date: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date(0).toISOString(),
      channel: mapChannel(r.channel),
      approved: !!r.approved,
      text: r.publicReview ?? "",
      categories: mapCategories(r.categories),
    };

    return NextResponse.json(mapped);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to approve review" }, { status: 500 });
  }
}
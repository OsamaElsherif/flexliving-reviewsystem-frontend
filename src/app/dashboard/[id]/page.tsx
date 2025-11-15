"use client";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../lib/api";
import dayjs from "dayjs";

export default function PropertyDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { data: reviews, error, isLoading, mutate } = useSWR(
    id ? `/api/dashboard/properties/${id}/reviews` : null,
    () => api.getDashboardReviews(id as string)
  );

  const { data: properties } = useSWR("/api/properties", api.getProperties);
  const propertyName = useMemo(() => properties?.find((p: any) => p.id === id)?.name ?? `Property ${id}`, [properties, id]);

  const [channel, setChannel] = useState<string | "">("");
  const [rating, setRating] = useState<number | 0>(0);
  const [category, setCategory] = useState<string | "">("");
  const [minCategory, setMinCategory] = useState<number | 0>(0);
  const [timeRange, setTimeRange] = useState<string>("All");
  const [sort, setSort] = useState<string>("Newest");
  const filtered = useMemo(() => {
    let list = reviews || [];
    if (channel) list = list.filter((r: any) => r.channel === channel);
    if (rating) list = list.filter((r: any) => r.rating >= rating);
    if (category && minCategory) {
      list = list.filter((r: any) => {
        const c = r.categories?.[category as keyof typeof r.categories];
        return typeof c === "number" && c >= minCategory;
      });
    }
    if (timeRange !== "All") {
      const now = dayjs();
      const threshold = timeRange === "Last 7 days" ? now.subtract(7, "day") : now.subtract(30, "day");
      list = list.filter((r: any) => dayjs(r.date).isAfter(threshold));
    }
    return list;
  }, [reviews, channel, rating, category, minCategory, timeRange]);

  const sorted = useMemo(() => {
    const arr = [...(filtered || [])];
    switch (sort) {
      case "Oldest":
        arr.sort((a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
        break;
      case "Rating high-low":
        arr.sort((a: any, b: any) => b.rating - a.rating);
        break;
      case "Rating low-high":
        arr.sort((a: any, b: any) => a.rating - b.rating);
        break;
      default:
        arr.sort((a: any, b: any) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
    }
    return arr;
  }, [filtered, sort]);

  async function toggleApprove(reviewId: string, approved: boolean) {
    const prev = reviews || [];
    mutate(
      prev.map((r: any) => (r.hostwayId === reviewId ? { ...r, approved } : r)),
      false
    );
    try {
      console.log(prev);
      await api.approveReview(reviewId, approved);
      mutate();
    } catch (e) {
      mutate(prev, false);
    }
  }

  const metrics = useMemo(() => {
    const list = reviews || [];
    const total = list.length;
    const avg = total ? list.reduce((a: number, r: any) => a + r.rating, 0) / total : 0;
    const approved = list.filter((r: any) => r.approved).length;
    const approvalRate = total ? Math.round((approved / total) * 100) : 0;
    const channels: Record<string, { count: number; avg: number }> = {};
    list.forEach((r: any) => {
      channels[r.channel] = channels[r.channel] || { count: 0, avg: 0 };
      channels[r.channel].count += 1;
      channels[r.channel].avg = Number(((channels[r.channel].avg * (channels[r.channel].count - 1) + r.rating) / channels[r.channel].count).toFixed(2));
    });
    const cats = ["cleanliness", "communication", "value", "location"] as const;
    const categoryAvgs: Record<string, number> = {};
    cats.forEach((k) => {
      const withCat = list.filter((r: any) => typeof r.categories?.[k] === "number");
      const cAvg = withCat.length ? withCat.reduce((a: number, r: any) => a + (r.categories?.[k] || 0), 0) / withCat.length : 0;
      categoryAvgs[k] = Number(cAvg.toFixed(2));
    });
    // Simple sparkline path for ratings over time
    const points = [...list].sort((a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()).map((r: any) => r.rating);
    const buildPath = (vals: number[]) => {
      const w = 240, h = 40, pad = 2;
      const n = vals.length || 1;
      return vals.map((v, i) => {
        const x = pad + (i * (w - pad * 2)) / Math.max(n - 1, 1);
        const y = pad + (h - pad * 2) * (1 - (v - 1) / 4); // map rating 1-5 to 0-1
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    };
    const sparklinePath = buildPath(points);
    // Simple keyword counts for recurring issues/mentions
    const keywords = ["noise", "clean", "location", "communication", "check-in", "responsive", "view", "modern"];
    const counts = keywords.map((k) => ({
      k,
      c: list.reduce((acc: number, r: any) => acc + (String(r.text || "").toLowerCase().includes(k) ? 1 : 0), 0),
    })).sort((a, b) => b.c - a.c);
    return { total, avg: Number(avg.toFixed(2)), approvalRate, channels, categoryAvgs, sparklinePath, counts };
  }, [reviews]);

  return (
    <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[280px,1fr] gap-8 p-6">
      <aside className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-lg font-semibold mb-3 text-brand">Filters</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted">Channel</label>
            <select className="mt-1 w-full border border-border rounded-lg p-2 text-sm" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="">All</option>
              <option>Airbnb</option>
              <option>Booking</option>
              <option>Google</option>
              <option>Hostaway</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted">Min Rating</label>
            <select className="mt-1 w-full border border-border rounded-lg p-2 text-sm" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={0}>All</option>
              <option value={5}>5</option>
              <option value={4}>4+</option>
              <option value={3}>3+</option>
              <option value={2}>2+</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted">Category</label>
            <select className="mt-1 w-full border border-border rounded-lg p-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="communication">Communication</option>
              <option value="value">Value</option>
              <option value="location">Location</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted">Min Category Score</label>
            <select className="mt-1 w-full border border-border rounded-lg p-2 text-sm" value={minCategory} onChange={(e) => setMinCategory(Number(e.target.value))}>
              <option value={0}>All</option>
              <option value={5}>5</option>
              <option value={4}>4+</option>
              <option value={3}>3+</option>
              <option value={2}>2+</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted">Time Range</label>
            <select className="mt-1 w-full border border-border rounded-lg p-2 text-sm" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option>All</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-muted">Sort</label>
            <select className="mt-1 w-full border border-border rounded-lg p-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Newest</option>
              <option>Oldest</option>
              <option>Rating high-low</option>
              <option>Rating low-high</option>
            </select>
          </div>
        </div>
      </aside>
      <main className="rounded-xl border border-border bg-white p-6">
        {isLoading && <div className="text-muted">Loading reviews...</div>}
        {error && <div className="text-red-600">Failed to load</div>}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-brand">{propertyName}</h1>
          <p className="text-muted">Total reviews: {reviews?.length || 0}</p>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted">Overall Avg Rating</div>
            <div className="text-2xl font-semibold">{metrics.avg.toFixed(2)}</div>
            <div className="text-xs text-muted">Approval rate: {metrics.approvalRate}%</div>
            <svg viewBox="0 0 240 40" width="240" height="40" className="mt-2">
              <path d={metrics.sparklinePath} fill="none" stroke="var(--brand)" strokeWidth="2" />
            </svg>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted">Channels</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(metrics.channels).map(([ch, s]) => (
                <span key={ch} className="px-2 py-1 rounded bg-gray-100 text-xs">
                  {ch}: {s.avg.toFixed(1)} ({s.count})
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border p-4">
            <div className="text-sm text-muted">Categories</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(metrics.categoryAvgs).map(([k, v]) => (
                <div key={k} className="px-2 py-1 rounded bg-gray-100 flex items-center justify-between">
                  <span className="capitalize">{k}</span>
                  <span>{Number(v).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-border p-4 mb-6">
          <div className="text-sm text-brand font-medium">Insights</div>
          <div className="mt-2 text-xs text-muted">Top mentions in reviews</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {metrics.counts.slice(0, 5).map((it) => (
              <span key={it.k} className="px-2 py-1 rounded bg-gray-100 text-xs">
                {it.k}: {it.c}
              </span>
            ))}
          </div>
        </section>
        <div className="grid gap-4">
          {sorted?.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.guestName}</div>
                  <div className="text-sm text-muted">{dayjs(r.date).format("MMM D, YYYY")} • {r.channel}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 text-sm">{r.rating.toFixed(1)}</span>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted">{r.approved ? "Approved" : "Pending"}</span>
                    <input type="checkbox" checked={r.approved} onChange={(e) => toggleApprove(r.hostwayId, e.target.checked)} />
                  </label>
                </div>
              </div>
              <p className="mt-2 text-gray-800 leading-relaxed">{r.text}</p>
              {r.categories && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                  {Object.entries(r.categories).map(([k, v]) => (
                    <span key={k} className="px-2 py-1 rounded bg-gray-100">
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
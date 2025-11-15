"use client";
import useSWR from "swr";
import Link from "next/link";
import { api } from "../lib/api";

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("/api/properties", api.getProperties);
  return (
    <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[280px,1fr] gap-8 p-6">
      <aside className="rounded-xl border border-border bg-white p-4">
        <h2 className="text-lg font-semibold mb-3 text-brand">Properties</h2>
        {isLoading && <div className="text-muted">Loading properties...</div>}
        {error && <div className="text-red-600">Failed to load</div>}
        <ul className="space-y-2">
          {data?.map((p) => (
            <li key={p.id}>
              <Link href={`/dashboard/${p.id}`} className="block rounded-lg p-2 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs bg-gray-100 rounded px-2 py-0.5">{Number(p.avgRating).toFixed(1)}</span>
                </div>
                <div className="text-xs text-muted">{p.totalReviews} reviews</div>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className="rounded-xl border border-border bg-white p-6">
        <div className="text-muted">Select a property from the sidebar to view reviews.</div>
        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.map((p) => (
            <div key={p.id} className="rounded-xl border border-border p-4">
              <div className="font-semibold text-brand">{p.name}</div>
              <div className="mt-1 text-sm text-muted">Avg rating: {Number(p.avgRating).toFixed(2)}</div>
              <div className="mt-1 text-sm text-muted">Reviews: {p.totalReviews}</div>
              <Link href={`/dashboard/${p.id}`} className="mt-3 inline-block text-sm text-brand">View performance →</Link>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
"use client";
import useSWR from "swr";
import Link from "next/link";
import { api } from "../lib/api";

export default function PropertiesPage() {
  const { data: properties, error, isLoading } = useSWR("/api/properties", api.getProperties);

  if (isLoading) return <div>Loading properties...</div>;
  if (error) return <div className="text-red-600">Failed to load properties</div>;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-semibold text-brand">All listings</h1>
        <p className="text-muted">Browse our Flex Living properties</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties?.map((p: any) => (
          <Link key={p.id} href={`/properties/${p.id}`} prefetch={false} className="rounded-xl border border-border bg-white p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <span className="px-2 py-1 rounded bg-gray-100 text-sm">{p.avgRating.toFixed(1)}</span>
            </div>
            <p className="text-muted">{p.totalReviews} reviews</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
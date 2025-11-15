"use client";
import useSWR from "swr";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useMemo, useState } from "react";

const photoUrls = [
  "https://bookingenginecdn.hostaway.com/listing/23248-70985-CplDgs6BeWDAvLRBM2gvtuPNW7j0IyNmbysqbBWCoZo-68e3d96d20af2?width=3840&quality=70&format=webp&v=2",
  "https://bookingenginecdn.hostaway.com/listing/23248-70985-CNtE6fBZ9N9ykN2LhZv6KOqYqQ7zvh0aWTDpdiQ3thk-68e3d97252271?width=3840&amp;quality=70&amp;format=webp&amp;v=2",
  "https://bookingenginecdn.hostaway.com/listing/23248-70985-ttJatZXWuRdgZIjAm8--uNbNP3g3gL9dMTh-C0mttjvA-68e3d97759750?width=3840&amp;quality=70&amp;format=webp&amp;v=2",
  "https://bookingenginecdn.hostaway.com/listing/23248-70985-xSbWavUhdHmhNzLHNOjZ--YCxRAdkMRyCXeqlwegk0kI-68e3d97ccdcf4?width=3840&amp;quality=70&amp;format=webp&amp;v=2",
  "https://bookingenginecdn.hostaway.com/listing/23248-70985-IjX3fy9qvRAsFhGoXKjmcW1ttvmLxujKiL2yYseBJD8-68e3d982c8b96?width=3840&amp;quality=70&amp;format=webp&amp;v=2",
];

export default function PublicPropertyPage() {
  const { id } = useParams<{ id: string }>();

  // Fetch all properties to get name, rating and reviews count
  const { data: properties } = useSWR("/api/properties", api.getProperties);
  const property = (properties || []).find((p: any) => p.id === id);

  // Fetch reviews for this property
  const { data: reviews, error, isLoading } = useSWR(
    id ? `/api/properties/${id}/reviews` : null,
    () => api.getPropertyReviews(id as string)
  );
  const approved = (reviews || []).filter((r: any) => r.approved);

  // Inquiry form state
  const [inq, setInq] = useState({
    name: "",
    email: "",
    guests: 1,
    checkIn: "",
    checkOut: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitOk, setSubmitOk] = useState<null | boolean>(null);

  async function submitInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setSubmitOk(null);
    try {
      await api.submitInquiry({ propertyId: id, ...inq });
      setSubmitOk(true);
      setInq({ name: "", email: "", guests: 1, checkIn: "", checkOut: "", message: "" });
    } catch (err) {
      setSubmitOk(false);
    } finally {
      setSubmitting(false);
    }
  }

  // Availability for current and next month
  const months = useMemo(() => [dayjs().startOf("month"), dayjs().add(1, "month").startOf("month")], []);
  const { data: avail0 } = useSWR(id ? [id, months[0].toISOString()] : null, (pid: string, iso: string) => api.getAvailability(pid, iso));
  const { data: avail1 } = useSWR(id ? [id, months[1].toISOString()] : null, (pid: string, iso: string) => api.getAvailability(pid, iso));

  return (
    <div className="space-y-10">
      {/* Gallery */}
      <section className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2 overflow-hidden rounded-xl">
          <img src={photoUrls[0]} alt="Main" className="h-64 w-full object-cover lg:h-[320px]" />
        </div>
        <img src={photoUrls[1]} alt="Photo" className="h-32 w-full object-cover rounded-xl lg:h-[155px]" />
        <img src={photoUrls[2]} alt="Photo" className="h-32 w-full object-cover rounded-xl lg:h-[155px]" />
        <img src={photoUrls[3]} alt="Photo" className="h-32 w-full object-cover rounded-xl lg:h-[155px]" />
        <img src={photoUrls[4]} alt="Photo" className="h-32 w-full object-cover rounded-xl lg:h-[155px]" />
      </section>

      {/* Header + booking card */}
      <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand">
            {property?.name || `Property ${id}`}
          </h1>
          <div className="mt-2 text-sm text-muted">
            Apartment · 5 guests · 2 bedrooms · 2 bathrooms
          </div>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-brand">⭐ {Number(property?.avgRating ?? 0).toFixed(2)}</span>
            <Link href="#reviews" prefetch={false} className="underline text-muted">
              {property?.totalReviews ?? 0} reviews
            </Link>
          </div>

          <p className="mt-6 text-muted leading-relaxed">
            This apartment is located in Hoxton, one of the coolest areas in London. It's a
            spacious unit with high-quality amenities to make your stay comfortable. The
            location is ideal—close to great cafes, shops, and bars, with easy access to
            transport.
          </p>
        </div>

        {/* Inquiry form */}
        <aside className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <form onSubmit={submitInquiry} className="grid gap-3">
            <div className="text-xs text-muted">Send an inquiry with your dates and details</div>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="h-11 rounded-lg border border-border px-3 text-sm" value={inq.checkIn} onChange={(e) => setInq({ ...inq, checkIn: e.target.value })} placeholder="Check-in" />
              <input type="date" className="h-11 rounded-lg border border-border px-3 text-sm" value={inq.checkOut} onChange={(e) => setInq({ ...inq, checkOut: e.target.value })} placeholder="Check-out" />
            </div>
            <input type="number" min={1} className="h-11 rounded-lg border border-border px-3 text-sm" value={inq.guests} onChange={(e) => setInq({ ...inq, guests: Number(e.target.value) })} placeholder="Guests" />
            <input type="text" className="h-11 rounded-lg border border-border px-3 text-sm" value={inq.name} onChange={(e) => setInq({ ...inq, name: e.target.value })} placeholder="Your name" />
            <input type="email" className="h-11 rounded-lg border border-border px-3 text-sm" value={inq.email} onChange={(e) => setInq({ ...inq, email: e.target.value })} placeholder="Email" />
            <textarea className="min-h-[72px] rounded-lg border border-border px-3 py-2 text-sm" value={inq.message} onChange={(e) => setInq({ ...inq, message: e.target.value })} placeholder="Message (optional)" />
            <button type="submit" disabled={submitting} className="mt-1 h-11 rounded-lg bg-black text-white">
              {submitting ? "Sending..." : "Send Inquiry"}
            </button>
            {submitOk === true && <div className="text-green-700 text-sm">Inquiry sent successfully.</div>}
            {submitOk === false && <div className="text-red-600 text-sm">Failed to send inquiry. Please try again.</div>}
          </form>
        </aside>
      </section>

      {/* Amenities with icons */}
      <section>
        <h2 className="text-xl font-semibold">Amenities</h2>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-muted">
          <div className="flex items-center gap-2"><img src="/globe.svg" alt="WiFi" className="h-4 w-4" /> Free WiFi</div>
          <div className="flex items-center gap-2"><img src="/globe.svg" alt="Internet" className="h-4 w-4" /> Internet</div>
          <div className="flex items-center gap-2"><img src="/window.svg" alt="Living room" className="h-4 w-4" /> Private living room</div>
          <div className="flex items-center gap-2"><img src="/file.svg" alt="Essentials" className="h-4 w-4" /> Essentials</div>
          <div className="flex items-center gap-2"><img src="/file.svg" alt="Towels" className="h-4 w-4" /> Towels</div>
          <div className="flex items-center gap-2"><img src="/window.svg" alt="Kitchen" className="h-4 w-4" /> Kitchen</div>
        </div>
      </section>

      {/* Availability (show available days) */}
      <section>
        <h2 className="text-xl font-semibold">Available days</h2>
        <div className="mt-3 grid gap-8 md:grid-cols-2">
          {[0, 1].map((offset) => {
            const start = months[offset];
            const daysInMonth = start.daysInMonth();
            const monthName = start.format("MMMM YYYY");
            const firstWeekday = start.day();
            const cells = Array(firstWeekday).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
            const avail = (offset === 0 ? avail0 : avail1) || [];
            const avSet = new Set(avail.map((d: string) => dayjs(d).date()));
            return (
              <div key={offset} className="rounded-xl border border-border p-4">
                <div className="mb-2 font-medium">{monthName}</div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div key={d} className="font-semibold">{d}</div>
                  ))}
                  {cells.map((c, idx) => (
                    <div
                      key={idx}
                      className={
                        c
                          ? `h-7 rounded border text-xs flex items-center justify-center ${
                              avSet.has(c) ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-border"
                            }`
                          : ""
                      }
                    >
                      {c ?? ""}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted">Highlighted days are available.</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-20">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <span className="text-sm text-muted">⭐ {Number(property?.avgRating ?? 0).toFixed(2)} ({approved.length})</span>
        </div>

        {isLoading && <div className="mt-2 text-muted">Loading reviews...</div>}
        {error && <div className="mt-2 text-red-600">Failed to load reviews</div>}

        {approved.length === 0 && !isLoading && !error && (
          <div className="mt-2 text-muted">No approved reviews yet.</div>
        )}

        <div className="mt-4 grid gap-4">
          {approved.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-muted">{r.guestName}</div>
                  <div className="text-xs text-muted">{dayjs(r.date).format("MMMM YYYY")}</div>
                </div>
                <span className="px-2 py-1 rounded bg-gray-100 text-sm">{r.rating.toFixed(1)}</span>
              </div>
              <p className="mt-2 text-gray-800 leading-relaxed">{r.text}</p>
              {r.channel && <div className="mt-2 text-xs text-muted">Source: {r.channel}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* House rules & cancellation */}
      <section>
        <h2 className="text-xl font-semibold">Good to know</h2>
        <div className="mt-3 grid gap-8 md:grid-cols-2">
          <div>
            <div className="font-medium">House Rules</div>
            <ul className="mt-1 space-y-1 text-sm text-muted">
              <li>Check-in: 3 pm</li>
              <li>Check-out: 10 am</li>
              <li>Pets: not allowed</li>
              <li>Smoking inside: not allowed</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Cancellation policy</div>
            <p className="mt-1 text-sm text-muted">100% refund up to 14 days before arrival</p>
          </div>
        </div>
      </section>
    </div>
  );
}
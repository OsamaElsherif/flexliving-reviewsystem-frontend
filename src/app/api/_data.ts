// In-memory mock data for properties and reviews
export type Channel = "Airbnb" | "Booking" | "Google" | "Hostaway";
export type CategoryRatings = {
  cleanliness?: number;
  communication?: number;
  value?: number;
  location?: number;
};
export type Review = {
  id: string;
  propertyId: string;
  guestName: string;
  rating: number; // 1-5
  date: string; // ISO string
  channel: Channel;
  approved: boolean;
  text: string;
  categories?: CategoryRatings;
  type?: "guest_to_host" | "host_to_guest";
};
export type Property = {
  id: string;
  name: string;
  avgRating: number;
  totalReviews: number;
};

let properties: Property[] = [
  { id: "p1", name: "Flex Living - Shoreditch Loft", avgRating: 4.7, totalReviews: 3 },
  { id: "p2", name: "Flex Living - Canary Wharf Suite", avgRating: 4.5, totalReviews: 3 },
  { id: "p3", name: "Flex Living - Soho Studio", avgRating: 4.8, totalReviews: 2 },
];

let reviews: Review[] = [
  {
    id: "r1",
    propertyId: "p1",
    guestName: "Alice",
    rating: 5,
    date: new Date().toISOString(),
    channel: "Airbnb",
    approved: true,
    text: "Wonderful stay, super clean and great location.",
    categories: { cleanliness: 5, communication: 5, value: 4, location: 5 },
    type: "guest_to_host",
  },
  {
    id: "r2",
    propertyId: "p1",
    guestName: "Bob",
    rating: 4,
    date: new Date().toISOString(),
    channel: "Booking",
    approved: false,
    text: "Smooth check-in. Some noise at night but overall good.",
    categories: { cleanliness: 4, communication: 5, value: 4, location: 3 },
    type: "guest_to_host",
  },
  {
    id: "r3",
    propertyId: "p1",
    guestName: "Flex Manager",
    rating: 5,
    date: new Date().toISOString(),
    channel: "Hostaway",
    approved: true,
    text: "Great guest, left the apartment spotless.",
    type: "host_to_guest",
  },
  {
    id: "r4",
    propertyId: "p2",
    guestName: "Chloe",
    rating: 5,
    date: new Date().toISOString(),
    channel: "Google",
    approved: true,
    text: "Amazing river view and modern furnishings.",
    categories: { cleanliness: 5, communication: 4, value: 4, location: 5 },
  },
  {
    id: "r5",
    propertyId: "p2",
    guestName: "David",
    rating: 4,
    date: new Date().toISOString(),
    channel: "Airbnb",
    approved: false,
    text: "Everything as described. Would return.",
  },
  {
    id: "r6",
    propertyId: "p2",
    guestName: "Host",
    rating: 5,
    date: new Date().toISOString(),
    channel: "Hostaway",
    approved: true,
    text: "Pleasant communication and followed house rules.",
    type: "host_to_guest",
  },
  {
    id: "r7",
    propertyId: "p3",
    guestName: "Ella",
    rating: 5,
    date: new Date().toISOString(),
    channel: "Booking",
    approved: true,
    text: "Stylish studio, perfect for a weekend.",
  },
  {
    id: "r8",
    propertyId: "p3",
    guestName: "Frank",
    rating: 5,
    date: new Date().toISOString(),
    channel: "Airbnb",
    approved: false,
    text: "Host was very responsive.",
  },
];

export function getProperties(): Property[] {
  // Recompute aggregated numbers based on current reviews
  return properties.map((p) => {
    const prs = reviews.filter((r) => r.propertyId === p.id);
    const avg = prs.length ? prs.reduce((a, r) => a + r.rating, 0) / prs.length : 0;
    return { ...p, avgRating: Number(avg.toFixed(2)), totalReviews: prs.length };
  });
}

export function getReviewsByPropertyId(propertyId: string): Review[] {
  return reviews.filter((r) => r.propertyId === propertyId);
}

export function findReviewById(reviewId: string): Review | undefined {
  return reviews.find((r) => r.id === reviewId);
}

export function setReviewApproval(reviewId: string, approved: boolean): Review | undefined {
  const idx = reviews.findIndex((r) => r.id === reviewId);
  if (idx >= 0) {
    reviews[idx] = { ...reviews[idx], approved };
    return reviews[idx];
  }
  return undefined;
}

export function seedData() {
  // reset to initial state (could be extended)
  // For now just keep as-is
  return { properties: getProperties(), reviews };
}

export type InquiryInput = { propertyId: string; name: string; email: string; guests: number; checkIn: string; checkOut: string; message?: string };
export type Inquiry = InquiryInput & { id: string; createdAt: string };
let inquiries: Inquiry[] = [];

export function addInquiry(input: InquiryInput): Inquiry {
  const id = `inq_${Date.now()}`;
  const createdAt = new Date().toISOString();
  const inq: Inquiry = { id, createdAt, ...input };
  inquiries.push(inq);
  return inq;
}

export function getAvailabilityForMonth(propertyId: string, monthIso: string): string[] {
  // Deterministic mock availability based on propertyId and month
  const start = new Date(monthIso);
  const year = start.getUTCFullYear();
  const month = start.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const codeSum = propertyId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const avail: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    if ((d + codeSum) % 3 === 0 || (d + codeSum) % 7 === 0) {
      const dt = new Date(Date.UTC(year, month, d));
      avail.push(dt.toISOString());
    }
  }
  return avail;
}
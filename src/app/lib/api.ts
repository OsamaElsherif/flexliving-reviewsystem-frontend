export type FetchOptions = RequestInit & { json?: any };

async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: json ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  getProperties: () => request<any[]>("/api/properties"),
  // Property page should read DB-approved reviews
  getPropertyReviews: (id: string) => request<any[]>(`/api/properties/${id}/reviews`),
  // Dashboard should read Hostaway reviews for the property
  getDashboardReviews: (id: string) => request<any[]>(`/api/dashboard/properties/${id}/reviews`),
  // Approvals by hostaway id routed through Next.js to backend Hostaway approval endpoint
  approveReview: (id: string, approved: boolean) => request<any>(`/api/reviews/${id}/approve`, { method: "PATCH", json: { approved } }),
  getAvailability: (id: string, monthIso: string) => request<string[]>(`/api/properties/${id}/availability?month=${encodeURIComponent(monthIso)}`),
  submitInquiry: (payload: { propertyId: string; name: string; email: string; guests: number; checkIn: string; checkOut: string; message?: string }) =>
    request<any>(`/api/inquiries`, { method: "POST", json: payload }),
};
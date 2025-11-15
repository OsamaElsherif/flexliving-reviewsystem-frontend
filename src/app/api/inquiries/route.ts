import { NextResponse } from "next/server";
import { addInquiry, InquiryInput } from "@/app/api/_data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const { propertyId, name, email, guests, checkIn, checkOut, message } = body as InquiryInput;
  if (!propertyId || !name || !email || !guests || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const created = addInquiry({ propertyId, name, email, guests, checkIn, checkOut, message });
  return NextResponse.json(created, { status: 201 });
}
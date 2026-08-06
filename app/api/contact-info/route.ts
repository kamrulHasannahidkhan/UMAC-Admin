import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ContactInfo from "@/models/ContactInfo";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  await connectDB();
  const doc = await ContactInfo.findOne();
  return withCors(NextResponse.json({ success: true, data: doc }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const existing = await ContactInfo.findOne();
  if (existing) return withCors(NextResponse.json({ success: false, error: "Already exists — use edit instead." }, { status: 400 }));
  const body = await req.json();
  const doc = await ContactInfo.create(body);
  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const existing = await ContactInfo.findOne();
  if (!existing) return withCors(NextResponse.json({ success: false, error: "Nothing to update yet" }, { status: 404 }));
  const body = await req.json();
  const updated = await ContactInfo.findByIdAndUpdate(existing._id, body, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

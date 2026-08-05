import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AboutHistory from "@/models/AboutHistory";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const body = await req.json();
  const updated = await AboutHistory.findByIdAndUpdate(params.id, body, { new: true });
  if (!updated) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await AboutHistory.findByIdAndDelete(params.id);
  if (!deleted) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));
  return withCors(NextResponse.json({ success: true, data: {} }));
}

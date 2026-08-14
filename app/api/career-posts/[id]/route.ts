import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CareerPost from "@/models/CareerPost";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const body = await req.json();
  const updated = await CareerPost.findByIdAndUpdate(id, body, { new: true });
  if (!updated) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const deleted = await CareerPost.findByIdAndDelete(id);
  if (!deleted) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));
  return withCors(NextResponse.json({ success: true, data: {} }));
}

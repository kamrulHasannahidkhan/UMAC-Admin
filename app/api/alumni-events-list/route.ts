import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AlumniEvent from "@/models/AlumniEvent";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  await connectDB();
  const events = await AlumniEvent.find().sort({ order: 1, createdAt: 1 });
  return withCors(NextResponse.json({ success: true, data: events }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const event = await AlumniEvent.create(body);
  return withCors(NextResponse.json({ success: true, data: event }, { status: 201 }));
}

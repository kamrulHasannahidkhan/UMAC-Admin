import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import NoticeItem from "@/models/NoticeItem";

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
  const items = await NoticeItem.find().sort({ order: 1, createdAt: -1 });
  return withCors(NextResponse.json({ success: true, data: items }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const item = await NoticeItem.create(body);
  return withCors(NextResponse.json({ success: true, data: item }, { status: 201 }));
}

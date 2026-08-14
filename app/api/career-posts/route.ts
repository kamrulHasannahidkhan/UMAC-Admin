import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CareerPost from "@/models/CareerPost";

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
  const posts = await CareerPost.find().sort({ order: 1, createdAt: -1 });
  return withCors(NextResponse.json({ success: true, data: posts }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const post = await CareerPost.create(body);
  return withCors(NextResponse.json({ success: true, data: post }, { status: 201 }));
}

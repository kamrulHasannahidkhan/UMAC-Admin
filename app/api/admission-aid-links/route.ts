import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AdmissionAidLink from "@/models/AdmissionAidLink";

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
  const links = await AdmissionAidLink.find().sort({ order: 1, createdAt: 1 });
  return withCors(NextResponse.json({ success: true, data: links }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const link = await AdmissionAidLink.create(body);
  return withCors(NextResponse.json({ success: true, data: link }, { status: 201 }));
}

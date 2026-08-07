import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Newsletter from "@/models/Newsletter";

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
  const subs = await Newsletter.find().sort({ createdAt: -1 });
  return withCors(NextResponse.json({ success: true, data: subs }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { email } = await req.json();

  if (!email) {
    return withCors(NextResponse.json({ success: false, error: "Email is required" }, { status: 400 }));
  }

  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return withCors(NextResponse.json({ success: false, error: "This email is already subscribed" }, { status: 400 }));
  }

  const sub = await Newsletter.create({ email });
  return withCors(NextResponse.json({ success: true, data: sub }, { status: 201 }));
}

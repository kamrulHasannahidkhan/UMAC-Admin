import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudentResult from "@/models/StudentResult";

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
  const results = await StudentResult.find().sort({ studentEmail: 1, order: 1 });
  return withCors(NextResponse.json({ success: true, data: results }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const result = await StudentResult.create(body);
  return withCors(NextResponse.json({ success: true, data: result }, { status: 201 }));
}

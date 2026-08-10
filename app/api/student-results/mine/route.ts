import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import StudentResult from "@/models/StudentResult";
import { getTokenFromRequest, verifyStudentToken } from "@/lib/studentAuth";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return withCors(NextResponse.json({ success: false, error: "No token" }, { status: 401 }));

  const payload = verifyStudentToken(token);
  if (!payload) return withCors(NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 }));

  await connectDB();
  const results = await StudentResult.find({ studentEmail: payload.email }).sort({ order: 1, createdAt: -1 });
  return withCors(NextResponse.json({ success: true, data: results }));
}

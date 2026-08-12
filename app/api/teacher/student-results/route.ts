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
  if (!token) return withCors(NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 }));
  if (!verifyStudentToken(token)) return withCors(NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 }));

  await connectDB();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return withCors(NextResponse.json({ success: false, error: "email query param is required" }, { status: 400 }));
  }

  const results = await StudentResult.find({ studentEmail: email }).sort({ year: 1, order: 1 });
  return withCors(NextResponse.json({ success: true, data: results }));
}

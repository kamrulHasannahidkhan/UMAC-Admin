import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
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
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (!q) {
    return withCors(NextResponse.json({ success: true, data: [] }));
  }

  const regex = new RegExp(q, "i");
  const students = await Student.find({
    $or: [{ name: regex }, { studentId: regex }, { email: regex }],
  })
    .select("name studentId email")
    .limit(20);

  return withCors(NextResponse.json({ success: true, data: students }));
}

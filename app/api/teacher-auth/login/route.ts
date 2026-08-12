import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import { signStudentToken } from "@/lib/studentAuth";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { email, password } = await req.json();

  if (!email?.trim() || !password) {
    return withCors(NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 }));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const teacher = await Teacher.findOne({ email: normalizedEmail });

  if (!teacher) {
    return withCors(NextResponse.json({ success: false, error: "No account found with this email — please sign up first" }, { status: 404 }));
  }

  const valid = await bcrypt.compare(password, teacher.passwordHash);
  if (!valid) {
    return withCors(NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 }));
  }

  const token = signStudentToken({ id: teacher._id.toString(), email: teacher.email, name: teacher.name });

  return withCors(NextResponse.json({ success: true, data: { token, name: teacher.name, email: teacher.email } }));
}

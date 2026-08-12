import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Alumni from "@/models/Alumni";
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
  const alumnus = await Alumni.findOne({ email: normalizedEmail });

  if (!alumnus || !alumnus.passwordHash) {
    return withCors(
      NextResponse.json({ success: false, error: "No claimed profile found — please claim your profile first" }, { status: 404 })
    );
  }

  const valid = await bcrypt.compare(password, alumnus.passwordHash);
  if (!valid) {
    return withCors(NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 }));
  }

  const token = signStudentToken({ id: alumnus._id.toString(), email: alumnus.email, name: alumnus.name });
  return withCors(NextResponse.json({ success: true, data: { token, name: alumnus.name, email: alumnus.email } }));
}

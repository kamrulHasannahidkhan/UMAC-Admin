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

const ALLOWED_DOMAIN = "@umac.edu.bd";

export async function POST(req: NextRequest) {
  await connectDB();
  const { name, designation, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return withCors(NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 }));
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
    return withCors(NextResponse.json({ success: false, error: `Email must end in ${ALLOWED_DOMAIN}` }, { status: 400 }));
  }

  if (password.length < 6) {
    return withCors(NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 }));
  }

  const existing = await Teacher.findOne({ email: normalizedEmail });
  if (existing) {
    return withCors(NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 }));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const teacher = await Teacher.create({
    name: name.trim(),
    designation: designation?.trim() || "",
    email: normalizedEmail,
    passwordHash,
  });

  const token = signStudentToken({ id: teacher._id.toString(), email: teacher.email, name: teacher.name });

  return withCors(
    NextResponse.json({ success: true, data: { token, name: teacher.name, email: teacher.email } }, { status: 201 })
  );
}

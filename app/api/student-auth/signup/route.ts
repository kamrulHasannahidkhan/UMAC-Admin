import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
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
  const { name, studentId, email, password } = await req.json();

  if (!name?.trim() || !studentId?.trim() || !email?.trim() || !password) {
    return withCors(NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 }));
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
    return withCors(
      NextResponse.json({ success: false, error: `Email must end in ${ALLOWED_DOMAIN}` }, { status: 400 })
    );
  }

  if (password.length < 6) {
    return withCors(NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 }));
  }

  const existing = await Student.findOne({ email: normalizedEmail });
  if (existing) {
    return withCors(NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 }));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const student = await Student.create({
    name: name.trim(),
    studentId: studentId.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = signStudentToken({ id: student._id.toString(), email: student.email, name: student.name });

  return withCors(
    NextResponse.json(
      { success: true, data: { token, name: student.name, email: student.email, studentId: student.studentId } },
      { status: 201 }
    )
  );
}

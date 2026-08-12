import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Alumni from "@/models/Alumni";
import { getTokenFromRequest, verifyStudentToken } from "@/lib/studentAuth";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return withCors(NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 }));
  const payload = verifyStudentToken(token);
  if (!payload) return withCors(NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 }));

  await connectDB();
  const alumnus = await Alumni.findById(payload.id).select("-passwordHash");
  if (!alumnus) return withCors(NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 }));

  return withCors(NextResponse.json({ success: true, data: alumnus }));
}

export async function PUT(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return withCors(NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 }));
  const payload = verifyStudentToken(token);
  if (!payload) return withCors(NextResponse.json({ success: false, error: "Invalid or expired session" }, { status: 401 }));

  await connectDB();
  const existing = await Alumni.findById(payload.id);
  if (!existing) return withCors(NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 }));

  const formData = await req.formData();
  const name = (formData.get("name") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const designation = (formData.get("designation") as string)?.trim();

  const updates: Record<string, any> = {
    name: name || existing.name,
    title: title || existing.title,
    designation: designation ?? existing.designation,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.imagePublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "uamc/alumni" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
    });
    updates.image = uploaded.secure_url;
    updates.imagePublicId = uploaded.public_id;
  }

  const updated = await Alumni.findByIdAndUpdate(payload.id, updates, { new: true }).select("-passwordHash");
  return withCors(NextResponse.json({ success: true, data: updated }));
}

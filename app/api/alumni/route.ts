import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Alumni from "@/models/Alumni";

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
  const alumni = await Alumni.find().select("-passwordHash").sort({ order: 1, createdAt: -1 });
  return withCors(NextResponse.json({ success: true, data: alumni }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();

  const name = (formData.get("name") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const designation = (formData.get("designation") as string)?.trim() || "";
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const file = formData.get("image") as File;

  if (!name || !title || !email) {
    return withCors(NextResponse.json({ success: false, error: "Name, title, and email are required" }, { status: 400 }));
  }
  if (!file) {
    return withCors(NextResponse.json({ success: false, error: "Image is required" }, { status: 400 }));
  }

  const existing = await Alumni.findOne({ email });
  if (existing) {
    return withCors(NextResponse.json({ success: false, error: "An alumni entry with this email already exists" }, { status: 400 }));
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploaded = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "uamc/alumni" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });

  const alumnus = await Alumni.create({
    name,
    title,
    designation,
    email,
    order: Number(formData.get("order") || 0),
    image: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
  });

  const { passwordHash, ...safe } = alumnus.toObject();
  return withCors(NextResponse.json({ success: true, data: safe }, { status: 201 }));
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Sustainability from "@/models/Sustainability";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  await connectDB();
  const doc = await Sustainability.findOne();
  return withCors(NextResponse.json({ success: true, data: doc }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const existing = await Sustainability.findOne();
  if (existing) return withCors(NextResponse.json({ success: false, error: "Already exists — use edit instead." }, { status: 400 }));

  const formData = await req.formData();
  const file = formData.get("image") as File;
  if (!file) return withCors(NextResponse.json({ success: false, error: "Image is required" }, { status: 400 }));

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploaded = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "uamc/sustainability" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });

  const doc = await Sustainability.create({
    headingPlain: formData.get("headingPlain"),
    headingHighlight: formData.get("headingHighlight"),
    description: formData.get("description"),
    image: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const existing = await Sustainability.findOne();
  if (!existing) return withCors(NextResponse.json({ success: false, error: "Nothing to update yet" }, { status: 404 }));

  const formData = await req.formData();
  const updates: Record<string, any> = {
    headingPlain: formData.get("headingPlain") ?? existing.headingPlain,
    headingHighlight: formData.get("headingHighlight") ?? existing.headingHighlight,
    description: formData.get("description") ?? existing.description,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.imagePublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "uamc/sustainability" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
    });
    updates.image = uploaded.secure_url;
    updates.imagePublicId = uploaded.public_id;
  }

  const updated = await Sustainability.findByIdAndUpdate(existing._id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import AboutBanner from "@/models/AboutBanner";

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
  const doc = await AboutBanner.findOne();
  return withCors(NextResponse.json({ success: true, data: doc }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const existing = await AboutBanner.findOne();
  if (existing) return withCors(NextResponse.json({ success: false, error: "Already exists — use edit instead." }, { status: 400 }));

  const formData = await req.formData();
  const file = formData.get("bgImage") as File;
  if (!file) return withCors(NextResponse.json({ success: false, error: "Background image is required" }, { status: 400 }));

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploaded = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "uamc/about-banner" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });

  const doc = await AboutBanner.create({
    headingPlain: formData.get("headingPlain"),
    headingHighlight: formData.get("headingHighlight"),
    bgImage: uploaded.secure_url,
    bgImagePublicId: uploaded.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const existing = await AboutBanner.findOne();
  if (!existing) return withCors(NextResponse.json({ success: false, error: "Nothing to update yet" }, { status: 404 }));

  const formData = await req.formData();
  const updates: Record<string, any> = {
    headingPlain: formData.get("headingPlain") ?? existing.headingPlain,
    headingHighlight: formData.get("headingHighlight") ?? existing.headingHighlight,
  };

  const file = formData.get("bgImage") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.bgImagePublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "uamc/about-banner" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
    });
    updates.bgImage = uploaded.secure_url;
    updates.bgImagePublicId = uploaded.public_id;
  }

  const updated = await AboutBanner.findByIdAndUpdate(existing._id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

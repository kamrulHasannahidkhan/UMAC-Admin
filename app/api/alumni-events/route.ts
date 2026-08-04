import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import AlumniEventContent from "@/models/AlumniEventContent";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

async function uploadImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "uamc/alumni-events" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });
}

export async function GET() {
  await connectDB();
  const doc = await AlumniEventContent.findOne();
  return withCors(NextResponse.json({ success: true, data: doc }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const existing = await AlumniEventContent.findOne();
  if (existing) {
    return withCors(NextResponse.json({ success: false, error: "Already exists — use edit instead." }, { status: 400 }));
  }

  const formData = await req.formData();
  const file = formData.get("image") as File;
  if (!file) {
    return withCors(NextResponse.json({ success: false, error: "Image is required" }, { status: 400 }));
  }

  const upload = await uploadImage(file);
  const doc = await AlumniEventContent.create({
    heading: formData.get("heading"),
    viewAllLink: formData.get("viewAllLink"),
    image: upload.secure_url,
    imagePublicId: upload.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const existing = await AlumniEventContent.findOne();
  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "Nothing to update yet" }, { status: 404 }));
  }

  const formData = await req.formData();
  const updates: Record<string, any> = {
    heading: formData.get("heading") ?? existing.heading,
    viewAllLink: formData.get("viewAllLink") ?? existing.viewAllLink,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.imagePublicId);
    const uploaded = await uploadImage(file);
    updates.image = uploaded.secure_url;
    updates.imagePublicId = uploaded.public_id;
  }

  const updated = await AlumniEventContent.findByIdAndUpdate(existing._id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

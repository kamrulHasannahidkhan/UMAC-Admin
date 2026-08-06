import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Slide from "@/models/Slide";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const formData = await req.formData();
  const existing = await Slide.findById(id);

  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "Slide not found" }, { status: 404 }));
  }

  const updates: Record<string, any> = {
    badge: formData.get("badge") ?? existing.badge,
    titleLine1: formData.get("titleLine1") ?? existing.titleLine1,
    highlight: formData.get("highlight") ?? existing.highlight,
    titleLine2: formData.get("titleLine2") ?? existing.titleLine2,
    order: formData.get("order") ? Number(formData.get("order")) : existing.order,
  };

  const file = formData.get("bgImage") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.bgImagePublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "uamc/hero-slides" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });
    updates.bgImage = uploadResult.secure_url;
    updates.bgImagePublicId = uploadResult.public_id;
  }

  const updated = await Slide.findByIdAndUpdate(id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const slide = await Slide.findById(id);

  if (!slide) {
    return withCors(NextResponse.json({ success: false, error: "Slide not found" }, { status: 404 }));
  }

  await cloudinary.uploader.destroy(slide.bgImagePublicId);
  await Slide.findByIdAndDelete(id);

  return withCors(NextResponse.json({ success: true, data: {} }));
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Facility from "@/models/Facility";

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
  const existing = await Facility.findById(id);

  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "Facility not found" }, { status: 404 }));
  }

  const updates: Record<string, any> = {
    name: formData.get("name") ?? existing.name,
    title: formData.get("title") ?? existing.title,
    description: formData.get("description") ?? existing.description,
    order: formData.get("order") ? Number(formData.get("order")) : existing.order,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.imagePublicId);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "uamc/facilities" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });

    updates.image = uploadResult.secure_url;
    updates.imagePublicId = uploadResult.public_id;
  }

  const updated = await Facility.findByIdAndUpdate(id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const facility = await Facility.findById(id);

  if (!facility) {
    return withCors(NextResponse.json({ success: false, error: "Facility not found" }, { status: 404 }));
  }

  await cloudinary.uploader.destroy(facility.imagePublicId);
  await Facility.findByIdAndDelete(id);

  return withCors(NextResponse.json({ success: true, data: {} }));
}

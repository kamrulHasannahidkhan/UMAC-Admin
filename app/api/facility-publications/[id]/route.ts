import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import FacilityPublication from "@/models/FacilityPublication";

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
  try {
    await connectDB();
    const { id } = await context.params;
    const formData = await req.formData();

    const existing = await FacilityPublication.findById(id);
    if (!existing) {
      return withCors(NextResponse.json({ success: false, error: "Publication not found" }, { status: 404 }));
    }

    const updates: Record<string, any> = {
      title: formData.get("title") !== null ? (formData.get("title") as string).trim() : existing.title,
      date: formData.get("date") !== null ? (formData.get("date") as string).trim() : existing.date,
      order: formData.get("order") !== null ? Number(formData.get("order")) : existing.order,
    };

    const file = formData.get("file") as File | null;
    if (file && file.size > 0) {
      if (existing.filePublicId) await cloudinary.uploader.destroy(existing.filePublicId, { resource_type: "raw" });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploaded = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "uamc/facility-publications", resource_type: "raw" },
            (err, result) => (err ? reject(err) : resolve(result))
          )
          .end(buffer);
      });
      updates.fileUrl = uploaded.secure_url;
      updates.filePublicId = uploaded.public_id;
    }

    const updated = await FacilityPublication.findByIdAndUpdate(id, updates, { new: true });
    return withCors(NextResponse.json({ success: true, data: updated }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const doc = await FacilityPublication.findById(id);
    if (!doc) {
      return withCors(NextResponse.json({ success: false, error: "Publication not found" }, { status: 404 }));
    }
    if (doc.filePublicId) await cloudinary.uploader.destroy(doc.filePublicId, { resource_type: "raw" });
    await FacilityPublication.findByIdAndDelete(id);
    return withCors(NextResponse.json({ success: true, data: {} }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

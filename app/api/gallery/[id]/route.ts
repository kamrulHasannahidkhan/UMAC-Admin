import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import GalleryImage from "@/models/GalleryImage";

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

    const existing = await GalleryImage.findById(id);
    if (!existing) {
      return withCors(NextResponse.json({ success: false, error: "Image not found" }, { status: 404 }));
    }

    const captionValue =
      formData.get("caption") !== null ? (formData.get("caption") as string).trim() : existing.caption;
    const orderValue = formData.get("order") !== null ? Number(formData.get("order")) : existing.order;

    const updates: Record<string, any> = {
      caption: captionValue,
      order: orderValue,
    };

    const file = formData.get("image") as File | null;
    if (file && file.size > 0) {
      if (existing.imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId);
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploaded = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "uamc/gallery" }, (err, result) => (err ? reject(err) : resolve(result)))
          .end(buffer);
      });

      updates.image = uploaded.secure_url;
      updates.imagePublicId = uploaded.public_id;
    }

    const updated = await GalleryImage.findByIdAndUpdate(id, updates, { new: true });
    return withCors(NextResponse.json({ success: true, data: updated }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await context.params;
    const image = await GalleryImage.findById(id);
    if (!image) {
      return withCors(NextResponse.json({ success: false, error: "Image not found" }, { status: 404 }));
    }

    if (image.imagePublicId) {
      await cloudinary.uploader.destroy(image.imagePublicId);
    }

    await GalleryImage.findByIdAndDelete(id);
    return withCors(NextResponse.json({ success: true, data: {} }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

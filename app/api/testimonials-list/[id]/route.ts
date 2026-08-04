import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Testimonial from "@/models/Testimonial";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const formData = await req.formData();
  const existing = await Testimonial.findById(params.id);

  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 }));
  }

  const updates: Record<string, any> = {
    rating: formData.get("rating") ? Number(formData.get("rating")) : existing.rating,
    quote: formData.get("quote") ?? existing.quote,
    name: formData.get("name") ?? existing.name,
    role: formData.get("role") ?? existing.role,
    order: formData.get("order") ? Number(formData.get("order")) : existing.order,
  };

  const file = formData.get("avatar") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.avatarPublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "uamc/testimonials" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });
    updates.avatar = uploadResult.secure_url;
    updates.avatarPublicId = uploadResult.public_id;
  }

  const updated = await Testimonial.findByIdAndUpdate(params.id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const testimonial = await Testimonial.findById(params.id);

  if (!testimonial) {
    return withCors(NextResponse.json({ success: false, error: "Testimonial not found" }, { status: 404 }));
  }

  await cloudinary.uploader.destroy(testimonial.avatarPublicId);
  await Testimonial.findByIdAndDelete(params.id);

  return withCors(NextResponse.json({ success: true, data: {} }));
}

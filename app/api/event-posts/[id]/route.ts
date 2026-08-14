import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import EventPost from "@/models/EventPost";

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
  const existing = await EventPost.findById(id);
  if (!existing) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));

  const updates: Record<string, any> = {
    title: formData.get("title") ?? existing.title,
    date: formData.get("date") ?? existing.date,
    time: formData.get("time") ?? existing.time,
    location: formData.get("location") ?? existing.location,
    description: formData.get("description") ?? existing.description,
    order: formData.get("order") ? Number(formData.get("order")) : existing.order,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.imagePublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "uamc/events" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
    });
    updates.image = uploaded.secure_url;
    updates.imagePublicId = uploaded.public_id;
  }

  const updated = await EventPost.findByIdAndUpdate(id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const event = await EventPost.findById(id);
  if (!event) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));
  await cloudinary.uploader.destroy(event.imagePublicId);
  await EventPost.findByIdAndDelete(id);
  return withCors(NextResponse.json({ success: true, data: {} }));
}

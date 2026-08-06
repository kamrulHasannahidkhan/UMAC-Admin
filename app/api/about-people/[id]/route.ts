import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import AboutPerson from "@/models/AboutPerson";

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
  const existing = await AboutPerson.findById(id);
  if (!existing) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));

  const updates: Record<string, any> = {
    group: formData.get("group") ?? existing.group,
    name: formData.get("name") ?? existing.name,
    title: formData.get("title") ?? existing.title,
    order: formData.get("order") ? Number(formData.get("order")) : existing.order,
  };

  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.photoPublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "uamc/about-people" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
    });
    updates.photo = uploaded.secure_url;
    updates.photoPublicId = uploaded.public_id;
  }

  const updated = await AboutPerson.findByIdAndUpdate(id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const person = await AboutPerson.findById(id);
  if (!person) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));
  await cloudinary.uploader.destroy(person.photoPublicId);
  await AboutPerson.findByIdAndDelete(id);
  return withCors(NextResponse.json({ success: true, data: {} }));
}

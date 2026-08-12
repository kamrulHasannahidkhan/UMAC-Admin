import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Alumni from "@/models/Alumni";

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
  const existing = await Alumni.findById(id);
  if (!existing) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));

  const name = (formData.get("name") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const designation = (formData.get("designation") as string)?.trim();

  const updates: Record<string, any> = {
    name: name || existing.name,
    title: title || existing.title,
    designation: designation ?? existing.designation,
    order: formData.get("order") ? Number(formData.get("order")) : existing.order,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.imagePublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "uamc/alumni" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
    });
    updates.image = uploaded.secure_url;
    updates.imagePublicId = uploaded.public_id;
  }

  const updated = await Alumni.findByIdAndUpdate(id, updates, { new: true }).select("-passwordHash");
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const alumnus = await Alumni.findById(id);
  if (!alumnus) return withCors(NextResponse.json({ success: false, error: "Not found" }, { status: 404 }));
  await cloudinary.uploader.destroy(alumnus.imagePublicId);
  await Alumni.findByIdAndDelete(id);
  return withCors(NextResponse.json({ success: true, data: {} }));
}

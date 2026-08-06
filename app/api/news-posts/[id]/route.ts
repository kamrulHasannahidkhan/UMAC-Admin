import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import NewsPost from "@/models/NewsPost";

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
  const existing = await NewsPost.findById(id);

  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "Post not found" }, { status: 404 }));
  }

  const updates: Record<string, any> = {
    category: formData.get("category") ?? existing.category,
    title: formData.get("title") ?? existing.title,
    excerpt: formData.get("excerpt") ?? existing.excerpt,
    author: formData.get("author") ?? existing.author,
    date: formData.get("date") ?? existing.date,
    order: formData.get("order") ? Number(formData.get("order")) : existing.order,
  };

  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    await cloudinary.uploader.destroy(existing.imagePublicId);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "uamc/news" }, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        })
        .end(buffer);
    });
    updates.image = uploadResult.secure_url;
    updates.imagePublicId = uploadResult.public_id;
  }

  const updated = await NewsPost.findByIdAndUpdate(id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await context.params;
  const post = await NewsPost.findById(id);

  if (!post) {
    return withCors(NextResponse.json({ success: false, error: "Post not found" }, { status: 404 }));
  }

  await cloudinary.uploader.destroy(post.imagePublicId);
  await NewsPost.findByIdAndDelete(id);

  return withCors(NextResponse.json({ success: true, data: {} }));
}

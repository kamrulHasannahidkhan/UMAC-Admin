import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Testimonial from "@/models/Testimonial";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET() {
  await connectDB();
  const list = await Testimonial.find().sort({ order: 1, createdAt: 1 });
  return withCors(NextResponse.json({ success: true, data: list }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();

  const file = formData.get("avatar") as File;
  if (!file) {
    return withCors(NextResponse.json({ success: false, error: "Avatar image is required" }, { status: 400 }));
  }

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

  const testimonial = await Testimonial.create({
    rating: Number(formData.get("rating")),
    quote: formData.get("quote"),
    name: formData.get("name"),
    role: formData.get("role"),
    order: Number(formData.get("order") || 0),
    avatar: uploadResult.secure_url,
    avatarPublicId: uploadResult.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: testimonial }, { status: 201 }));
}

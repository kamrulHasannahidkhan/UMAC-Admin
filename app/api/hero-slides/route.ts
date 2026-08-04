import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import Slide from "@/models/Slide";

// Allow the client-site (different origin) to call this API
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
  const slides = await Slide.find().sort({ order: 1, createdAt: 1 });
  return withCors(NextResponse.json({ success: true, data: slides }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();

  const badge = formData.get("badge") as string;
  const titleLine1 = formData.get("titleLine1") as string;
  const highlight = formData.get("highlight") as string;
  const titleLine2 = formData.get("titleLine2") as string;
  const order = Number(formData.get("order") || 0);
  const file = formData.get("bgImage") as File;

  if (!file) {
    return withCors(NextResponse.json({ success: false, error: "bgImage is required" }, { status: 400 }));
  }

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

  const slide = await Slide.create({
    badge,
    titleLine1,
    highlight,
    titleLine2,
    order,
    bgImage: uploadResult.secure_url,
    bgImagePublicId: uploadResult.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: slide }, { status: 201 }));
}
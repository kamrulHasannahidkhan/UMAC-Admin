import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import GalleryImage from "@/models/GalleryImage";

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
  try {
    await connectDB();
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    return withCors(NextResponse.json({ success: true, data: images }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const file = formData.get("image") as File | null;
    const caption = (formData.get("caption") as string)?.trim();
    const order = Number(formData.get("order") || 0);

    if (!file || file.size === 0) {
      return withCors(NextResponse.json({ success: false, error: "Image is required" }, { status: 400 }));
    }
    if (!caption) {
      return withCors(NextResponse.json({ success: false, error: "Caption is required" }, { status: 400 }));
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "uamc/gallery" }, (err, result) => (err ? reject(err) : resolve(result)))
        .end(buffer);
    });

    const image = await GalleryImage.create({
      caption,
      order,
      image: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
    });

    return withCors(NextResponse.json({ success: true, data: image }, { status: 201 }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

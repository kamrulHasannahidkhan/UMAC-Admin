import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import CampusLifeCard from "@/models/CampusLifeCard";

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
  const cards = await CampusLifeCard.find().sort({ order: 1, createdAt: 1 });
  return withCors(NextResponse.json({ success: true, data: cards }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();
  const label = formData.get("label") as string;
  const order = Number(formData.get("order") || 0);
  const file = formData.get("image") as File;

  if (!file) {
    return withCors(NextResponse.json({ success: false, error: "image is required" }, { status: 400 }));
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "uamc/campus-life" }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });

  const card = await CampusLifeCard.create({
    label,
    order,
    image: uploadResult.secure_url,
    imagePublicId: uploadResult.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: card }, { status: 201 }));
}

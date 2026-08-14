import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import EventPost from "@/models/EventPost";

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
  const events = await EventPost.find().sort({ order: 1, createdAt: -1 });
  return withCors(NextResponse.json({ success: true, data: events }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();

  const file = formData.get("image") as File;
  if (!file) {
    return withCors(NextResponse.json({ success: false, error: "Image is required" }, { status: 400 }));
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploaded = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "uamc/events" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });

  const event = await EventPost.create({
    title: formData.get("title"),
    date: formData.get("date"),
    time: formData.get("time"),
    location: formData.get("location"),
    description: formData.get("description"),
    order: Number(formData.get("order") || 0),
    image: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: event }, { status: 201 }));
}

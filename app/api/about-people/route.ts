import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import AboutPerson from "@/models/AboutPerson";

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
  const people = await AboutPerson.find().sort({ group: 1, order: 1, createdAt: 1 });
  return withCors(NextResponse.json({ success: true, data: people }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();
  const file = formData.get("photo") as File;
  if (!file) return withCors(NextResponse.json({ success: false, error: "Photo is required" }, { status: 400 }));

  const name = (formData.get("name") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const group = (formData.get("group") as string)?.trim();

  if (!name) {
    return withCors(NextResponse.json({ success: false, error: "Name is required" }, { status: 400 }));
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uploaded = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "uamc/about-people" }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });

  const person = await AboutPerson.create({
    group,
    name,
    title,
    order: Number(formData.get("order") || 0),
    photo: uploaded.secure_url,
    photoPublicId: uploaded.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: person }, { status: 201 }));
}

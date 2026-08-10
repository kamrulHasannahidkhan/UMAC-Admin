import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import FacilityContent from "@/models/FacilityContent";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

async function uploadImage(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "uamc/facility-content" }, (err, result) => (err ? reject(err) : resolve(result)))
      .end(buffer);
  });
}

const SECTIONS = ["hospital", "library", "meu", "training"];

export async function GET(req: NextRequest) {
  await connectDB();
  const section = req.nextUrl.searchParams.get("section");

  if (section) {
    if (!SECTIONS.includes(section)) {
      return withCors(NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 }));
    }
    const doc = await FacilityContent.findOne({ section });
    return withCors(NextResponse.json({ success: true, data: doc }));
  }

  const all = await FacilityContent.find();
  return withCors(NextResponse.json({ success: true, data: all }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();
  const section = formData.get("section") as string;

  if (!SECTIONS.includes(section)) {
    return withCors(NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 }));
  }

  const existing = await FacilityContent.findOne({ section });
  if (existing) {
    return withCors(
      NextResponse.json({ success: false, error: "Content for this section already exists — use edit instead." }, { status: 400 })
    );
  }

  const image = formData.get("image") as File;
  if (!image || image.size === 0) {
    return withCors(NextResponse.json({ success: false, error: "Image is required" }, { status: 400 }));
  }

  const uploaded = await uploadImage(image);
  const items = JSON.parse((formData.get("items") as string) || "[]");
  const items2 = JSON.parse((formData.get("items2") as string) || "[]");

  const doc = await FacilityContent.create({
    section,
    heading: formData.get("heading"),
    description: formData.get("description"),
    image: uploaded.secure_url,
    imagePublicId: uploaded.public_id,
    stat1Label: formData.get("stat1Label") || undefined,
    stat1Value: formData.get("stat1Value") || undefined,
    stat2Label: formData.get("stat2Label") || undefined,
    stat2Value: formData.get("stat2Value") || undefined,
    items,
    items2,
  });

  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const formData = await req.formData();
  const section = formData.get("section") as string;

  if (!SECTIONS.includes(section)) {
    return withCors(NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 }));
  }

  const existing = await FacilityContent.findOne({ section });
  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "No content to update for this section yet" }, { status: 404 }));
  }

  const updates: Record<string, any> = {
    heading: formData.get("heading") ?? existing.heading,
    description: formData.get("description") ?? existing.description,
    stat1Label: formData.get("stat1Label") ?? existing.stat1Label,
    stat1Value: formData.get("stat1Value") ?? existing.stat1Value,
    stat2Label: formData.get("stat2Label") ?? existing.stat2Label,
    stat2Value: formData.get("stat2Value") ?? existing.stat2Value,
  };

  if (formData.get("items") !== null) {
    updates.items = JSON.parse(formData.get("items") as string);
  }
  if (formData.get("items2") !== null) {
    updates.items2 = JSON.parse(formData.get("items2") as string);
  }

  const image = formData.get("image") as File | null;
  if (image && image.size > 0) {
    if (existing.imagePublicId) await cloudinary.uploader.destroy(existing.imagePublicId);
    const uploaded = await uploadImage(image);
    updates.image = uploaded.secure_url;
    updates.imagePublicId = uploaded.public_id;
  }

  const updated = await FacilityContent.findByIdAndUpdate(existing._id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

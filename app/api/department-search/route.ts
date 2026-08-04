import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import DepartmentSearch from "@/models/DepartmentSearch";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

async function uploadImage(file: File, folder: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      })
      .end(buffer);
  });
}

export async function GET() {
  await connectDB();
  const doc = await DepartmentSearch.findOne();
  return withCors(NextResponse.json({ success: true, data: doc }));
}

export async function POST(req: NextRequest) {
  await connectDB();

  const existing = await DepartmentSearch.findOne();
  if (existing) {
    return withCors(
      NextResponse.json({ success: false, error: "This section already exists — use edit instead." }, { status: 400 })
    );
  }

  const formData = await req.formData();
  const sideImage1 = formData.get("sideImage1") as File;
  const sideImage2 = formData.get("sideImage2") as File;

  if (!sideImage1 || !sideImage2) {
    return withCors(NextResponse.json({ success: false, error: "Both side images are required" }, { status: 400 }));
  }

  const [upload1, upload2] = await Promise.all([
    uploadImage(sideImage1, "uamc/department-search"),
    uploadImage(sideImage2, "uamc/department-search"),
  ]);

  const doc = await DepartmentSearch.create({
    heading: formData.get("heading"),
    description: formData.get("description"),
    searchPlaceholder: formData.get("searchPlaceholder"),
    popularSearches: JSON.parse((formData.get("popularSearches") as string) || "[]"),
    popularProgram: null,
    sideImage1: upload1.secure_url,
    sideImage1PublicId: upload1.public_id,
    sideImage2: upload2.secure_url,
    sideImage2PublicId: upload2.public_id,
    badgeNumber: formData.get("badgeNumber"),
    badgeText: formData.get("badgeText"),
  });

  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const existing = await DepartmentSearch.findOne();

  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "No section to update yet" }, { status: 404 }));
  }

  const formData = await req.formData();
  const updates: Record<string, any> = {
    heading: formData.get("heading") ?? existing.heading,
    description: formData.get("description") ?? existing.description,
    searchPlaceholder: formData.get("searchPlaceholder") ?? existing.searchPlaceholder,
    badgeNumber: formData.get("badgeNumber") ?? existing.badgeNumber,
    badgeText: formData.get("badgeText") ?? existing.badgeText,
  };

  if (formData.get("popularSearches")) {
    updates.popularSearches = JSON.parse(formData.get("popularSearches") as string);
  }

  const sideImage1 = formData.get("sideImage1") as File | null;
  if (sideImage1 && sideImage1.size > 0) {
    await cloudinary.uploader.destroy(existing.sideImage1PublicId);
    const uploaded = await uploadImage(sideImage1, "uamc/department-search");
    updates.sideImage1 = uploaded.secure_url;
    updates.sideImage1PublicId = uploaded.public_id;
  }

  const sideImage2 = formData.get("sideImage2") as File | null;
  if (sideImage2 && sideImage2.size > 0) {
    await cloudinary.uploader.destroy(existing.sideImage2PublicId);
    const uploaded = await uploadImage(sideImage2, "uamc/department-search");
    updates.sideImage2 = uploaded.secure_url;
    updates.sideImage2PublicId = uploaded.public_id;
  }

  const updated = await DepartmentSearch.findByIdAndUpdate(existing._id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

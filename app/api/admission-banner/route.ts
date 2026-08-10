import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import AdmissionBanner from "@/models/AdmissionBanner";

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
      .upload_stream({ folder: "uamc/admission-banner" }, (err, result) => (err ? reject(err) : resolve(result)))
      .end(buffer);
  });
}

// Single-document section: GET returns the one Admission Banner doc (or null)
export async function GET() {
  await connectDB();
  const banner = await AdmissionBanner.findOne();
  return withCors(NextResponse.json({ success: true, data: banner }));
}

// POST creates it the first time; PUT (below) updates it after that
export async function POST(req: NextRequest) {
  await connectDB();
  const existing = await AdmissionBanner.findOne();
  if (existing) {
    return withCors(
      NextResponse.json(
        { success: false, error: "Admission banner already exists — use edit instead." },
        { status: 400 }
      )
    );
  }

  const formData = await req.formData();
  const bgImage = formData.get("bgImage") as File;
  const logoImage = formData.get("logoImage") as File | null;

  if (!bgImage || bgImage.size === 0) {
    return withCors(NextResponse.json({ success: false, error: "Background image is required" }, { status: 400 }));
  }

  const bgUploaded = await uploadImage(bgImage);
  let logoUploaded: any = null;
  if (logoImage && logoImage.size > 0) {
    logoUploaded = await uploadImage(logoImage);
  }

  const banner = await AdmissionBanner.create({
    headingPlain: formData.get("headingPlain"),
    headingHighlight: formData.get("headingHighlight"),
    bgImage: bgUploaded.secure_url,
    bgImagePublicId: bgUploaded.public_id,
    logoImage: logoUploaded?.secure_url,
    logoImagePublicId: logoUploaded?.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: banner }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const existing = await AdmissionBanner.findOne();
  if (!existing) {
    return withCors(
      NextResponse.json({ success: false, error: "No Admission banner to update yet" }, { status: 404 })
    );
  }

  const formData = await req.formData();
  const updates: Record<string, any> = {
    headingPlain: formData.get("headingPlain") ?? existing.headingPlain,
    headingHighlight: formData.get("headingHighlight") ?? existing.headingHighlight,
  };

  const bgImage = formData.get("bgImage") as File | null;
  if (bgImage && bgImage.size > 0) {
    if (existing.bgImagePublicId) {
      await cloudinary.uploader.destroy(existing.bgImagePublicId);
    }
    const uploaded = await uploadImage(bgImage);
    updates.bgImage = uploaded.secure_url;
    updates.bgImagePublicId = uploaded.public_id;
  }

  const logoImage = formData.get("logoImage") as File | null;
  if (logoImage && logoImage.size > 0) {
    if (existing.logoImagePublicId) {
      await cloudinary.uploader.destroy(existing.logoImagePublicId);
    }
    const uploaded = await uploadImage(logoImage);
    updates.logoImage = uploaded.secure_url;
    updates.logoImagePublicId = uploaded.public_id;
  }

  const updated = await AdmissionBanner.findByIdAndUpdate(existing._id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import PrincipalMessage from "@/models/PrincipalMessage";

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
  const doc = await PrincipalMessage.findOne();
  return withCors(NextResponse.json({ success: true, data: doc }));
}

export async function POST(req: NextRequest) {
  await connectDB();

  const existing = await PrincipalMessage.findOne();
  if (existing) {
    return withCors(
      NextResponse.json({ success: false, error: "Already exists — use edit instead." }, { status: 400 })
    );
  }

  const formData = await req.formData();
  const signatureImage = formData.get("signatureImage") as File;
  const photo = formData.get("photo") as File;

  if (!signatureImage || !photo) {
    return withCors(NextResponse.json({ success: false, error: "Signature image and photo are both required" }, { status: 400 }));
  }

  const [sigUpload, photoUpload] = await Promise.all([
    uploadImage(signatureImage, "uamc/principal-message"),
    uploadImage(photo, "uamc/principal-message"),
  ]);

  const doc = await PrincipalMessage.create({
    badge: formData.get("badge"),
    headingPlain: formData.get("headingPlain"),
    headingHighlight: formData.get("headingHighlight"),
    honorificLabel: formData.get("honorificLabel"),
    name: formData.get("name"),
    positionTitle: formData.get("positionTitle"),
    positionSuffix: formData.get("positionSuffix"),
    subtitle: formData.get("subtitle"),
    description: formData.get("description"),
    buttonText: formData.get("buttonText"),
    signatureImage: sigUpload.secure_url,
    signatureImagePublicId: sigUpload.public_id,
    photo: photoUpload.secure_url,
    photoPublicId: photoUpload.public_id,
  });

  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const existing = await PrincipalMessage.findOne();

  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "Nothing to update yet" }, { status: 404 }));
  }

  const formData = await req.formData();
  const updates: Record<string, any> = {
    badge: formData.get("badge") ?? existing.badge,
    headingPlain: formData.get("headingPlain") ?? existing.headingPlain,
    headingHighlight: formData.get("headingHighlight") ?? existing.headingHighlight,
    honorificLabel: formData.get("honorificLabel") ?? existing.honorificLabel,
    name: formData.get("name") ?? existing.name,
    positionTitle: formData.get("positionTitle") ?? existing.positionTitle,
    positionSuffix: formData.get("positionSuffix") ?? existing.positionSuffix,
    subtitle: formData.get("subtitle") ?? existing.subtitle,
    description: formData.get("description") ?? existing.description,
    buttonText: formData.get("buttonText") ?? existing.buttonText,
  };

  const signatureImage = formData.get("signatureImage") as File | null;
  if (signatureImage && signatureImage.size > 0) {
    await cloudinary.uploader.destroy(existing.signatureImagePublicId);
    const uploaded = await uploadImage(signatureImage, "uamc/principal-message");
    updates.signatureImage = uploaded.secure_url;
    updates.signatureImagePublicId = uploaded.public_id;
  }

  const photo = formData.get("photo") as File | null;
  if (photo && photo.size > 0) {
    await cloudinary.uploader.destroy(existing.photoPublicId);
    const uploaded = await uploadImage(photo, "uamc/principal-message");
    updates.photo = uploaded.secure_url;
    updates.photoPublicId = uploaded.public_id;
  }

  const updated = await PrincipalMessage.findByIdAndUpdate(existing._id, updates, { new: true });
  return withCors(NextResponse.json({ success: true, data: updated }));
}

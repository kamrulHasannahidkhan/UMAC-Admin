



import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import cloudinary from "@/lib/cloudinary";

import About from "@/models/About";

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

      .upload_stream({ folder: "uamc/about" }, (err, result) => {

        if (err) reject(err);

        else resolve(result);

      })

      .end(buffer);

  });

}

// Single-document section: GET returns the one About doc (or null)

export async function GET() {

  await connectDB();

  const about = await About.findOne();

  return withCors(NextResponse.json({ success: true, data: about }));

}

// POST creates it the first time; PUT (below) updates it after that

export async function POST(req: NextRequest) {

  await connectDB();

  const existing = await About.findOne();

  if (existing) {

    return withCors(

      NextResponse.json({ success: false, error: "About section already exists — use edit instead." }, { status: 400 })

    );

  }

  const formData = await req.formData();

  const image1 = formData.get("image1") as File;

  const image2 = formData.get("image2") as File;

  if (!image1 || !image2) {

    return withCors(NextResponse.json({ success: false, error: "Both images are required" }, { status: 400 }));

  }

  const [upload1, upload2] = await Promise.all([uploadImage(image1), uploadImage(image2)]);

  const about = await About.create({

    badge: formData.get("badge"),

    headingPlain: formData.get("headingPlain"),

    headingHighlight: formData.get("headingHighlight"),

    paragraph1: formData.get("paragraph1"),

    paragraph2: formData.get("paragraph2"),

    image1: upload1.secure_url,

    image1PublicId: upload1.public_id,

    image2: upload2.secure_url,

    image2PublicId: upload2.public_id,

  });

  return withCors(NextResponse.json({ success: true, data: about }, { status: 201 }));

}

export async function PUT(req: NextRequest) {

  await connectDB();

  const existing = await About.findOne();

  if (!existing) {

    return withCors(NextResponse.json({ success: false, error: "No About section to update yet" }, { status: 404 }));

  }

  const formData = await req.formData();

  const updates: Record<string, any> = {

    badge: formData.get("badge") ?? existing.badge,

    headingPlain: formData.get("headingPlain") ?? existing.headingPlain,

    headingHighlight: formData.get("headingHighlight") ?? existing.headingHighlight,

    paragraph1: formData.get("paragraph1") ?? existing.paragraph1,

    paragraph2: formData.get("paragraph2") ?? existing.paragraph2,

  };

  const image1 = formData.get("image1") as File | null;

  if (image1 && image1.size > 0) {

    await cloudinary.uploader.destroy(existing.image1PublicId);

    const uploaded = await uploadImage(image1);

    updates.image1 = uploaded.secure_url;

    updates.image1PublicId = uploaded.public_id;

  }

  const image2 = formData.get("image2") as File | null;

  if (image2 && image2.size > 0) {

    await cloudinary.uploader.destroy(existing.image2PublicId);

    const uploaded = await uploadImage(image2);

    updates.image2 = uploaded.secure_url;

    updates.image2PublicId = uploaded.public_id;

  }

  const updated = await About.findByIdAndUpdate(existing._id, updates, { new: true });

  return withCors(NextResponse.json({ success: true, data: updated }));

}


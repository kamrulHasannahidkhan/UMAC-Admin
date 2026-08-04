
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import cloudinary from "@/lib/cloudinary";

import Stats from "@/models/Stats";

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

      .upload_stream({ folder: "uamc/stats" }, (err, result) => {

        if (err) reject(err);

        else resolve(result);

      })

      .end(buffer);

  });

}

export async function GET() {

  await connectDB();

  const stats = await Stats.findOne();

  return withCors(NextResponse.json({ success: true, data: stats }));

}

export async function POST(req: NextRequest) {

  await connectDB();

  const existing = await Stats.findOne();

  if (existing) {

    return withCors(

      NextResponse.json({ success: false, error: "Stats section already exists — use edit instead." }, { status: 400 })

    );

  }

  const formData = await req.formData();

  const bgImage = formData.get("bgImage") as File;

  const statsJson = formData.get("stats") as string;

  if (!bgImage) {

    return withCors(NextResponse.json({ success: false, error: "Background image is required" }, { status: 400 }));

  }

  const upload = await uploadImage(bgImage);

  const stats = JSON.parse(statsJson);

  const doc = await Stats.create({

    bgImage: upload.secure_url,

    bgImagePublicId: upload.public_id,

    stats,

  });

  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));

}

export async function PUT(req: NextRequest) {

  await connectDB();

  const existing = await Stats.findOne();

  if (!existing) {

    return withCors(NextResponse.json({ success: false, error: "No stats section to update yet" }, { status: 404 }));

  }

  const formData = await req.formData();

  const statsJson = formData.get("stats") as string;

  const updates: Record<string, any> = {

    stats: JSON.parse(statsJson),

  };

  const bgImage = formData.get("bgImage") as File | null;

  if (bgImage && bgImage.size > 0) {

    await cloudinary.uploader.destroy(existing.bgImagePublicId);

    const uploaded = await uploadImage(bgImage);

    updates.bgImage = uploaded.secure_url;

    updates.bgImagePublicId = uploaded.public_id;

  }

  const updated = await Stats.findByIdAndUpdate(existing._id, updates, { new: true });

  return withCors(NextResponse.json({ success: true, data: updated }));

}


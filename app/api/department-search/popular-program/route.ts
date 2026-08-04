
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import cloudinary from "@/lib/cloudinary";

import DepartmentSearch from "@/models/DepartmentSearch";

function withCors(res: NextResponse) {

  res.headers.set("Access-Control-Allow-Origin", "*");

  res.headers.set("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS");

  res.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return res;

}

export async function OPTIONS() {

  return withCors(new NextResponse(null, { status: 204 }));

}

// Create or edit the single Popular Program (upsert-style)

export async function PUT(req: NextRequest) {

  await connectDB();

  const doc = await DepartmentSearch.findOne();

  if (!doc) {

    return withCors(NextResponse.json({ success: false, error: "Create the main section first" }, { status: 404 }));

  }

  const formData = await req.formData();

  const title = formData.get("title") as string;

  const file = formData.get("image") as File | null;

  if (!title) {

    return withCors(NextResponse.json({ success: false, error: "Title is required" }, { status: 400 }));

  }

  let imageData = doc.popularProgram;

  if (file && file.size > 0) {

    if (doc.popularProgram?.imagePublicId) {

      await cloudinary.uploader.destroy(doc.popularProgram.imagePublicId);

    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<any>((resolve, reject) => {

      cloudinary.uploader

        .upload_stream({ folder: "uamc/department-search" }, (err, result) => {

          if (err) reject(err);

          else resolve(result);

        })

        .end(buffer);

    });

    imageData = { image: uploaded.secure_url, imagePublicId: uploaded.public_id };

  } else if (!doc.popularProgram) {

    return withCors(NextResponse.json({ success: false, error: "An image is required to create the Popular Program" }, { status: 400 }));

  }

  doc.popularProgram = { title, ...imageData };

  await doc.save();

  return withCors(NextResponse.json({ success: true, data: doc.popularProgram }));

}

export async function DELETE() {

  await connectDB();

  const doc = await DepartmentSearch.findOne();

  if (!doc || !doc.popularProgram) {

    return withCors(NextResponse.json({ success: false, error: "No Popular Program to delete" }, { status: 404 }));

  }

  if (doc.popularProgram.imagePublicId) {

    await cloudinary.uploader.destroy(doc.popularProgram.imagePublicId);

  }

  doc.popularProgram = null;

  await doc.save();

  return withCors(NextResponse.json({ success: true, data: {} }));

}


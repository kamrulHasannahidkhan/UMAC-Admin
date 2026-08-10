import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import FacilityPublication from "@/models/FacilityPublication";

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
  try {
    await connectDB();
    const docs = await FacilityPublication.find().sort({ order: 1, createdAt: -1 });
    return withCors(NextResponse.json({ success: true, data: docs }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string)?.trim();
    const date = (formData.get("date") as string)?.trim();
    const order = Number(formData.get("order") || 0);

    if (!file || file.size === 0) {
      return withCors(NextResponse.json({ success: false, error: "PDF file is required" }, { status: 400 }));
    }
    if (!title || !date) {
      return withCors(NextResponse.json({ success: false, error: "Title and Date are required" }, { status: 400 }));
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "uamc/facility-publications", resource_type: "raw" },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });

    const doc = await FacilityPublication.create({
      title,
      date,
      order,
      fileUrl: uploaded.secure_url,
      filePublicId: uploaded.public_id,
    });

    return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

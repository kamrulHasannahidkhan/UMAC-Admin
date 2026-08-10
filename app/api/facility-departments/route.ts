import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import FacilityDepartment from "@/models/FacilityDepartment";

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
    const depts = await FacilityDepartment.find().sort({ order: 1, createdAt: -1 });
    return withCors(NextResponse.json({ success: true, data: depts }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();

    const file = formData.get("image") as File | null;
    const name = (formData.get("name") as string)?.trim();
    const establishedDate = (formData.get("establishedDate") as string)?.trim();
    const learnMoreLink = (formData.get("learnMoreLink") as string)?.trim() || "#";
    const order = Number(formData.get("order") || 0);

    if (!file || file.size === 0) {
      return withCors(NextResponse.json({ success: false, error: "Image is required" }, { status: 400 }));
    }
    if (!name || !establishedDate) {
      return withCors(NextResponse.json({ success: false, error: "Name and Established Date are required" }, { status: 400 }));
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploaded = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "uamc/facility-departments" }, (err, result) => (err ? reject(err) : resolve(result)))
        .end(buffer);
    });

    const dept = await FacilityDepartment.create({
      name,
      establishedDate,
      learnMoreLink,
      order,
      image: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
    });

    return withCors(NextResponse.json({ success: true, data: dept }, { status: 201 }));
  } catch (err: any) {
    return withCors(NextResponse.json({ success: false, error: err.message }, { status: 500 }));
  }
}

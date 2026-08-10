import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import FacilityAccordion from "@/models/FacilityAccordion";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

const SECTIONS = ["seminar", "hostel", "laboratory", "cafeteria"];

export async function GET(req: NextRequest) {
  await connectDB();
  const section = req.nextUrl.searchParams.get("section");

  if (section) {
    if (!SECTIONS.includes(section)) {
      return withCors(NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 }));
    }
    const doc = await FacilityAccordion.findOne({ section });
    return withCors(NextResponse.json({ success: true, data: doc }));
  }

  const all = await FacilityAccordion.find();
  return withCors(NextResponse.json({ success: true, data: all }));
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { section, heading, description, items } = body;

  if (!SECTIONS.includes(section)) {
    return withCors(NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 }));
  }

  const existing = await FacilityAccordion.findOne({ section });
  if (existing) {
    return withCors(
      NextResponse.json({ success: false, error: "Content for this section already exists — use edit instead." }, { status: 400 })
    );
  }

  const doc = await FacilityAccordion.create({ section, heading, description, items: items || [] });
  return withCors(NextResponse.json({ success: true, data: doc }, { status: 201 }));
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const { section, heading, description, items } = body;

  if (!SECTIONS.includes(section)) {
    return withCors(NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 }));
  }

  const existing = await FacilityAccordion.findOne({ section });
  if (!existing) {
    return withCors(NextResponse.json({ success: false, error: "No content to update for this section yet" }, { status: 404 }));
  }

  const updated = await FacilityAccordion.findByIdAndUpdate(
    existing._id,
    {
      heading: heading ?? existing.heading,
      description: description ?? existing.description,
      items: items ?? existing.items,
    },
    { new: true }
  );

  return withCors(NextResponse.json({ success: true, data: updated }));
}

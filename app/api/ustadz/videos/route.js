import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import UstadzVideo from "@/models/UstadzVideo";

export async function GET(req) {
  await connect();

  const { searchParams } = new URL(req.url);
  const ustadz = searchParams.get("ustadz");

  if (!ustadz) {
    return NextResponse.json({ error: "ustadz required" }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const data = await UstadzVideo.findOne({
    ustadzSlug: ustadz,
    date: today,
  });

  console.log(data);

  return NextResponse.json({
    cached: true,
    videos: data?.videos || [],
  });
}

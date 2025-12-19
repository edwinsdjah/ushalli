import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import UstadzVideo from "@/models/UstadzVideo";

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const ustadz = searchParams.get("ustadz");

    if (!ustadz) {
      return NextResponse.json({ error: "ustadz required" }, { status: 400 });
    }

    const data = await UstadzVideo.findOne({
      ustadzSlug: ustadz,
    })
      .select("videos lastUpdated")
      .lean();

    return NextResponse.json({
      cached: !!data,
      lastUpdated: data?.lastUpdated ?? null,
      videos: data?.videos ?? [],
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

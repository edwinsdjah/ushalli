import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import UstadzVideo from "@/models/UstadzVideo";
import { USTADZ_LIST } from "@/data/ustadz";
import { fetchLatestVideosByChannel } from "@/lib/youtube";

export async function GET() {
  await connect();

  const today = new Date().toISOString().slice(0, 10);
  const result = [];

  for (const ustadz of USTADZ_LIST) {
    const videos = await fetchLatestVideosByChannel(ustadz.channelId);

    await UstadzVideo.findOneAndUpdate(
      {
        ustadzSlug: ustadz.slug,
        date: today,
      },
      {
        ustadzSlug: ustadz.slug,
        date: today,
        videos,
      },
      {
        upsert: true,
        new: true,
      }
    );

    result.push(ustadz.slug);
  }

  return NextResponse.json({
    status: "ok",
    updated: result,
  });
}

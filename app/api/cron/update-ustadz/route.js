import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import UstadzVideo from "@/models/UstadzVideo";
import { USTADZ_LIST } from "@/data/ustadz";
import { fetchLatestVideosByChannel } from "@/lib/youtube";

export async function GET() {
  try {
    await connect();

    const result = [];

    await Promise.all(
      USTADZ_LIST.map(async (ustadz) => {
        const videos = await fetchLatestVideosByChannel(ustadz.channelId);

        await UstadzVideo.findOneAndUpdate(
          { ustadzSlug: ustadz.slug },
          {
            $set: {
              name: ustadz.name,
              videos: videos.slice(0, 5), // 🔒 replace total
              lastUpdated: new Date(),
            },
            $setOnInsert: {
              ustadzSlug: ustadz.slug,
            },
          },
          {
            upsert: true,
            new: true,
          }
        );
      })
    );

    return NextResponse.json({
      status: "ok",
      updated: result,
    });
  } catch (err) {
    console.error("Update video error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";
import { sendPush } from "@/lib/push";

export async function POST(req) {
  try {
    const body = await req.json();

    // Simple server secret auth
    const SERVER_SECRET = process.env.PUSH_SERVER_SECRET;
    if (!SERVER_SECRET) {
      console.warn(
        "PUSH_SERVER_SECRET not set - consider adding it for security."
      );
    } else if (!body || body.secret !== SERVER_SECRET) {
      console.warn("Unauthorized attempt to send push");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = body.payload || {
      title: "Waktu Sholat",
      body: "Waktunya sholat — cek aplikasi",
      url: "/",
      tag: "prayer-time",
    };

    // Connect to MongoDB
    await connect();

    // Fetch all subscribers
    const subs = await Subscription.find({}).lean();
    const results = [];

    for (const s of subs) {
      try {
        const subsObj = {
          endpoint: s.endpoint,
          keys: s.keys || {},
        };

        const r = await sendPush(
          subsObj,
          typeof payload === "string" ? payload : JSON.stringify(payload)
        );

        if (!r.ok) {
          const status = r.error && r.error.statusCode;
          if (status === 410 || status === 404) {
            console.log(`Deleting expired subscription: ${s.endpoint}`);
            await Subscription.deleteOne({ endpoint: s.endpoint });
          }
        }

        results.push({
          endpoint: s.endpoint,
          ok: r.ok ?? true,
          error: r.ok ? null : String(r.error),
        });
      } catch (error) {
        console.error(`Error sending to ${s.endpoint}:`, error);
        results.push({
          endpoint: s.endpoint,
          ok: false,
          error: String(error),
        });
      }
    }
    console.log("Push results:", results);
    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (error) {
    console.error("Send push server error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connect from "@/src/lib/mongoose";
import Subscription from "@/src/models/Subscription";
import { sendPush } from "@/src/lib/push";

export async function POST(req) {
  try {
    const body = await req.json();
    // For safety: require a server secret in body (very simple auth)
    const SERVER_SECRET = process.env.PUSH_SERVER_SECRET;
    if (!SERVER_SECRET) {
      console.warn(
        "PUSH_SERVER_SECRET not set - consider adding it for security."
      );
    } else if (!body || body.secret !== SERVER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload =
      body.payload ||
      JSON.stringify({
        title: "Waktu Sholat",
        body: "Waktunya sholat — cek aplikasi",
        url: "/",
        tag: "prayer-time",
      });

    await connect();
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
            await Subscription.deleteOne({
              endpoint: s.endpoint,
            });
          }
        }
        results.push({
          endpoint: s.endpoint,
          ok: s.ok,
          error: s.ok ? null : String(r.error),
        });
      } catch (error) {
        console.error("error sending to", s.endpoint, innerErr);
        results.push({
          endpoint: s.endpoint,
          ok: false,
          error: String(innerErr),
        });
      }
    }
    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (error) {
    console.error("send error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();
    const { userId, endpoint, keys, subscription } = body;
    console.log(body);
    if (!userId)
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    if (!subscription)
      return NextResponse.json(
        { error: "subscription required" },
        { status: 400 }
      );

    const subEndpoint = endpoint || subscription.endpoint;
    const subKeys = keys || subscription.keys;

    if (!subEndpoint)
      return NextResponse.json({ error: "endpoint required" }, { status: 400 });

    // ✅ Update jika userId sudah ada, else create
    await Subscription.findOneAndUpdate(
      { userId },
      {
        endpoint: subEndpoint,
        keys: subKeys,
        subscription,
        lastSeenAt: new Date(),
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("subscribe error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("SUB BODY >>>", body);

    if (!body || !body.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription body" },
        { status: 400 }
      );
    }

    await connect();

    const { endpoint, keys, userId } = body;

    const filter = { endpoint };
    const update = {
      $set: {
        endpoint,
        keys: keys || {},
        userId: userId || null,
        lastSeenAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    };

    const options = { upsert: true, new: true };

    const doc = await Subscription.findOneAndUpdate(filter, update, options);

    return NextResponse.json(
      { ok: true, subscription: { endpoint: doc.endpoint } },
      { status: 201 }
    );
  } catch (error) {
    console.error("subscribe error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

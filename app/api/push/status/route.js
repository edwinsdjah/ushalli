import { NextResponse } from "next/server";
import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";

export async function GET(req) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const sub = await Subscription.findOne({ userId }).lean();

    return NextResponse.json({
      subscribed: !!sub,
    });
  } catch (err) {
    console.error("push status error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

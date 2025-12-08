import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";

export async function POST(req) {
  try {
    await connect();
    const body = await req.json();
    const { endpoint } = body;
    if (!endpoint) {
      return Response.json(
        { ok: false, error: "Missing endpoint" },
        { status: 400 }
      );
    }
    const deleted = await Subscription.findOneAndDelete({ endpoint });
    if (!deleted) {
      return Response.json(
        { ok: false, message: "Subscription not found" },
        { status: 404 }
      );
    }
    return Response.json({ ok: true, message: "Unsubscribed successfully" });
  } catch (error) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}

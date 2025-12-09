import connect from "@/lib/mongoose";
import Subscription from "@/models/Subscription";
import PrayerTimes from "@/models/PrayerTimes";

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

    // 1) Hapus subscription
    const deleted = await Subscription.findOneAndDelete({ endpoint });

    if (!deleted) {
      return Response.json(
        { ok: false, message: "Subscription not found" },
        { status: 404 }
      );
    }

    // 2) Ambil userId dari subscription yang dihapus
    const userId = deleted.userId;

    if (userId) {
      // 3) Hapus semua prayer times untuk user ini
      await PrayerTimes.deleteMany({ userId });
      console.log("Deleted Prayer Times for user:", userId);
    }

    return Response.json({
      ok: true,
      message: "Unsubscribed & prayer times removed",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { lat, lon } = await req.json();

    if (!lat || !lon)
      return Response.json({ error: "Missing coordinates" }, { status: 400 });

    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`;
    const res = await fetch(url);
    const data = await res.json();

    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// scripts/cron-trigger.js
const URL = process.env.CRON_URL || "http://localhost:3000/api/cron/send";
const SECRET = process.env.PUSH_SERVER_SECRET || "my-very-strong-secret-123";

(async () => {
  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET }),
    });

    const json = await res.json();
    console.log("cron result:", json);
  } catch (err) {
    console.error("Cron error:", err);
  }
})();

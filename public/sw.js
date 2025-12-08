// Service worker menerima payload push dari server → tampilkan notif.
self.addEventListener("push", (event) => {
  // Payload dari server diubah menjadi JSON.

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    // payload bukan JSON → treat sebagai text biasa
    data = { title: "Notification", body: event.data?.text() };
  }

  const title = data.title || "Pengingat Waktu Sholat";
  const body = data.body || "Sudah masuk waktu sholat.";
  const icon = "/icons/icon-192.png";
  const badge = "/icons/badge.png";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      data,
      vibrate: [200, 100, 200],
    })
  );
});

// API untuk menampilkan notifikasi di device.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});

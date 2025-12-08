const webpush = require("web-push");

const keys = webpush.generateVAPIDKeys();
console.log("VAPID_PUBLIC_KEY=", keys.publicKey);
console.log("VAPID_PRIVATE_KEY=", keys.privateKey);

// optionally print in .env format
console.log("\n.env line:");
console.log(`VAPID_PUBLIC_KEY="${keys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${keys.privateKey}"`);

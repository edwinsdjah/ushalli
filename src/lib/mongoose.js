import mongoose from 'mongoose';
import { cache } from 'react';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local'
  );
}

/**
 * Global is used to cache the connection in dev to avoid recompiling creating many connections.
 * In production, Next.js often reuses the same container but this is still safe.
 */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      // options recommended by Mongoose docs for serverless
      bufferCommands: false,
      // useNewUrlParser and useUnifiedTopology are default in new mongoose but okay to be explicit
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(mongooseInstance => {
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;

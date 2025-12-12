// Simple MongoDB connection tester using mongoose directly so the script can run
// without compiling TypeScript.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from .env.local or .env in project root if present.
// Try using dotenv if available, otherwise parse file manually.
function loadEnv() {
  const root = path.resolve(__dirname, '..');
  const candidates = ['.env.local', '.env'];
  for (const name of candidates) {
    const p = path.join(root, name);
    if (fs.existsSync(p)) {
      try {
        // prefer dotenv if installed
        try {
          require('dotenv').config({ path: p });
          return;
        } catch (_) {
          // parse manually
          const contents = fs.readFileSync(p, 'utf8');
          for (const line of contents.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eq = trimmed.indexOf('=');
            if (eq === -1) continue;
            const key = trimmed.slice(0, eq).trim();
            let val = trimmed.slice(eq + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }
            if (!(key in process.env)) process.env[key] = val;
          }
          return;
        }
      } catch (e) {
        // ignore and continue
      }
    }
  }
}

loadEnv();

async function run() {
  try {
    console.log('Starting MongoDB connection test...');

  const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Please set the MONGODB_URI environment variable before running this test.');
      process.exit(2);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully. State:', mongoose.connection.readyState);
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (err) {
    console.error('Failed to connect to MongoDB:');
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

run();

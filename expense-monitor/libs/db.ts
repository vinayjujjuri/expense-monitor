import mongoose from "mongoose";

const uri = process.env.MONGODB_URI ?? "";

if (!uri) {
	// Do not throw here so other environments (like Next.js build) won't break.
	// The test script will validate presence of URI and fail fast if needed.
	// eslint-disable-next-line no-console
	console.warn("MONGODB_URI is not set. Database operations will fail until it is provided.");
}

export async function connectDB(): Promise<typeof mongoose> {
	if (!uri) throw new Error("MONGODB_URI environment variable is required to connect to MongoDB");

	if (mongoose.connection.readyState === 1) {
		return mongoose;
	}

	// Use new URL parser and unified topology by default via mongoose options
	await mongoose.connect(uri, {
		// options kept minimal; mongoose has sensible defaults
	});

	return mongoose;
}

export async function disconnectDB(): Promise<void> {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
	}
}

export default mongoose;

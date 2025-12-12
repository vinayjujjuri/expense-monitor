import { NextResponse } from 'next/server';
import { connectDB } from '../../../libs/db';
import Transaction from '../../../models/transaction';

export async function GET(request: Request) {
	// Minimal GET handler
	return NextResponse.json({ message: 'GET /api/credit' });
}

// Expected body shape: { amount: number, creditType?: string, transactionDate?: string }
export async function POST(request: Request) {
	let body: any;
	try {
		body = await request.json();
	} catch (err) {
		return NextResponse.json({ message: 'POST /api/credit - invalid or missing JSON body' }, { status: 400 });
	}

	const { amount, creditType, transactionDate } = body || {};
	if (typeof amount !== 'number' || Number.isNaN(amount)) {
		return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
	}

	try {
		await connectDB();

		const doc = new Transaction({
			amount,
			type: 'credit',
			creditType: creditType ?? null,
			transactionDate: transactionDate ? new Date(transactionDate) : undefined,
		});

		const saved = await doc.save();

		return NextResponse.json({ message: 'Credit saved', saved }, { status: 201 });
	} catch (err: any) {
		// Log server-side for debugging
		// eslint-disable-next-line no-console
		console.error('Failed to save credit:', err && err.stack ? err.stack : err);
		return NextResponse.json({ message: 'Failed to save credit', error: String(err) }, { status: 500 });
	}
}

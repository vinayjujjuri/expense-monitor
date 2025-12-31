import { NextResponse } from 'next/server';
import { connectDB } from '../../../libs/db';
import Transaction from '../../../models/transaction';
import { getToken } from 'next-auth/jwt';
import authOptions from '@/libs/auth';

	export async function GET(request: Request) {
		await connectDB();
		const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
		if (!token || !token.sub) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}
		const userId = token.sub;
		// Fetch all credits for the logged-in user
		const credits = await Transaction.find({ userId, type: 'credit' }).sort({ transactionDate: -1 });
		return NextResponse.json({ credits });
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
		const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
		if (!token || !token.sub) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}
		const userId = token.sub;

		const doc = new Transaction({
			userId,
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

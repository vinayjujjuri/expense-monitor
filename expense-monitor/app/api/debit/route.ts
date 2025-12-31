import { NextResponse } from 'next/server';
import { connectDB } from '../../../libs/db';
import Transaction from '../../../models/transaction';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/libs/auth';

	export async function GET() {
		await connectDB();
		const session = await getServerSession(authOptions as any);
		if (!session || !(session as any).user) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}
		const userId = (session as any).user.id;
		// Fetch all debits for the logged-in user
		const debits = await Transaction.find({ userId, type: 'debit' }).sort({ transactionDate: -1 });
		return NextResponse.json({ debits });
	}


// Expected body: { amount: number, category?: string, transactionDate?: string }
export async function POST(request: Request) {
	let body: any;
	try {
		body = await request.json();
	} catch (err) {
		return NextResponse.json({ message: 'POST /api/debit - invalid or missing JSON body' }, { status: 400 });
	}

	const { amount, category, transactionDate } = body || {};
	if (typeof amount !== 'number' || Number.isNaN(amount)) {
		return NextResponse.json({ message: 'Invalid amount' }, { status: 400 });
	}

	try {
		await connectDB();
		const session = await getServerSession(authOptions as any);
		if (!session || !(session as any).user) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}
		const userId = (session as any).user.id;

		const doc = new Transaction({
			userId,
			amount,
			type: 'debit',
			category: category ?? null,
			transactionDate: transactionDate ? new Date(transactionDate) : undefined,
		});

		const saved = await doc.save();

		return NextResponse.json({ message: 'Debit saved', saved }, { status: 201 });
	} catch (err: any) {
		// eslint-disable-next-line no-console
		console.error('Failed to save debit:', err && err.stack ? err.stack : err);
		return NextResponse.json({ message: 'Failed to save debit', error: String(err) }, { status: 500 });
	}
}


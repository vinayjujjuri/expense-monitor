import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	return NextResponse.json({ message: 'GET /api/debit' });
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		return NextResponse.json({ message: 'POST /api/debit', body });
	} catch (err) {
		return NextResponse.json({ message: 'POST /api/debit - no JSON body' });
	}
}


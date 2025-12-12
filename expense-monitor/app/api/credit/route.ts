import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	// Minimal GET handler
	return NextResponse.json({ message: 'GET /api/credit' });
}

export async function POST(request: Request) {
	// Minimal POST handler: echo back JSON body if possible
	try {
		const body = await request.json();
		return NextResponse.json({ message: 'POST /api/credit', body });
	} catch (err) {
		return NextResponse.json({ message: 'POST /api/credit - no JSON body' });
	}
}

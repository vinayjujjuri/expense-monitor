import { NextResponse } from "next/server";
import { startOfYear, endOfYear } from "date-fns";
import { connectDB } from "@/libs/db";
import Transaction from "@/models/transaction";
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
	await connectDB();

	const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
	if (!token || !token.sub) {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}
	const userId = token.sub;

	const url = new URL(request.url);
    console.log("URL:", url.toString());
	const yearParam = url.searchParams.get("year");
	const year = yearParam ? Number(yearParam) : new Date().getFullYear();

	const start = startOfYear(new Date(year, 0, 1));
	const end = endOfYear(new Date(year, 11, 31));

	// Aggregate monthly totals for debits in the selected year for the logged-in user
	const pipeline = [
		{ $match: { userId: typeof userId === 'string' ? new (require('mongoose')).Types.ObjectId(userId) : userId, type: "debit", createdAt: { $gte: start, $lte: end } } },
		{
			$group: {
				_id: { $month: "$createdAt" },
				totalAmount: { $sum: "$amount" },
			},
		},
		{ $sort: { _id: 1 } },
		{
			$project: {
				_id: 0,
				month: "$_id",
				totalAmount: 1,
			},
		},
	];

	// TypeScript's typings for aggregate pipelines can be strict; cast to any here
	const results = await (Transaction.aggregate(pipeline as any) as any).exec();

	return NextResponse.json({ year, monthlyTotals: results });
}

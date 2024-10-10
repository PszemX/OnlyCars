import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.json({ message: "No token" }, { status: 400 });
	}

	const userId = parseInt(token, 10);

	await prisma.user.update({
		where: { id: userId },
		data: { isEmailConfirmed: true },
	});

	return NextResponse.json({ message: "Email confirmed" }, { status: 200 });
}

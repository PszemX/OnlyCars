import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
	const { email, password } = await request.json();

	if (!email || !password) {
		return NextResponse.json(
			{ message: "Email and password are required" },
			{ status: 400 }
		);
	}

	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		return NextResponse.json(
			{ message: "Invalid login credentials" },
			{ status: 400 }
		);
	}

	if (!user.isEmailConfirmed) {
		return NextResponse.json(
			{ message: "Email not confirmed" },
			{ status: 400 }
		);
	}

	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		return NextResponse.json(
			{ message: "Invalid login credentials" },
			{ status: 400 }
		);
	}

	try {
		const token = await new SignJWT({ userId: user.id })
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime("7d")
			.sign(new TextEncoder().encode(JWT_SECRET));

		const response = NextResponse.json(
			{ message: "Login successful" },
			{ status: 200 }
		);

		response.cookies.set("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});

		return response;
	} catch (error) {
		console.error("Error generating token:", error);
		return NextResponse.json({ message: "Server error" }, { status: 500 });
	}
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const response = await fetch(
				"http://localhost:5001/api/users/login",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				}
			);

			if (response.ok) {
				const data = await response.json();
				Cookies.set("token", data.token, { expires: 1 });
				router.push("/");
			} else {
				const data = await response.json();
				throw new Error(data.message || "Login failed.");
			}
		} catch (err: any) {
			setError(err.message || "An error occurred during login");
		}
	};

	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Login</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="Your email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					{error && <p className="text-red-500">{error}</p>}
					<Button type="submit" className="w-full">
						Login
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex justify-center">
				<p className="text-sm text-gray-600">
					{"Don't have an account?"}{" "}
					<Link
						href="/register"
						className="text-blue-600 hover:underline"
					>
						Register
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function RegisterForm() {
	const [userName, setUserName] = useState("");
	const [email, setEmail] = useState("");
	const [isEmailValid, setIsEmailValid] = useState(true);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordStrength, setPasswordStrength] = useState(0);
	const [passwordsMatch, setPasswordsMatch] = useState(true);
	const [formValid, setFormValid] = useState(false);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");

		if (password !== confirmPassword) {
			setError("Passwords are not the same");
			return;
		}

		try {
			const response = await fetch(
				"http://localhost:5001/api/users/register",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userName: userName,
						email: email,
						password: password,
					}),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Registration failed.");
			}

			setSuccessMessage("Registration successful.");
			await new Promise((resolve) => setTimeout(resolve, 2000));
			router.push("/login");
		} catch (err: any) {
			setError(err.message || "An error occurred during registration");
		}
	};

	const checkPasswordStrength = (password: string) => {
		let strength = 0;
		if (password.length > 6) strength += 1;
		if (/[a-z]/.test(password)) strength += 1;
		if (/[A-Z]/.test(password)) strength += 1;
		if (/[0-9]/.test(password)) strength += 1;
		if (/[$@#&!]/.test(password)) strength += 1;
		setPasswordStrength((strength / 5) * 100);
	};

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		setIsEmailValid(emailRegex.test(email));
	};

	useEffect(() => {
		checkPasswordStrength(password);
		setPasswordsMatch(password === confirmPassword);
		setFormValid(
			email !== "" &&
				isEmailValid &&
				password !== "" &&
				confirmPassword !== "" &&
				password === confirmPassword
		);
	}, [email, isEmailValid, password, confirmPassword]);

	const getPasswordStrengthColor = () => {
		if (passwordStrength <= 33) return "bg-red-500";
		if (passwordStrength <= 66) return "bg-orange-500";
		return "bg-green-500";
	};

	const getPasswordStrengthText = () => {
		if (passwordStrength <= 33) return "Weak";
		if (passwordStrength <= 66) return "Medium";
		return "Strong";
	};

	return (
		<Card className="w-[350px]">
			<CardHeader>
				<CardTitle>Register</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="userName">User Name</Label>
						<Input
							id="userName"
							type="text"
							placeholder="Your name"
							value={userName}
							onChange={(e) => setUserName(e.target.value)}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="your@example.com"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								validateEmail(e.target.value);
							}}
							required
						/>
						{!isEmailValid && email && (
							<p className="text-sm text-red-500">
								Provide a valid email address
							</p>
						)}
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
						{password && (
							<div className="space-y-1">
								<div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
									<div
										className={`h-full ${getPasswordStrengthColor()}`}
										style={{
											width: `${passwordStrength}%`,
										}}
									></div>
								</div>
								<p className="text-sm text-gray-600">
									Password strength:{" "}
									{getPasswordStrengthText()}
								</p>
							</div>
						)}
					</div>
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirm Password
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
						{!passwordsMatch && confirmPassword && (
							<p className="text-sm text-red-500">
								Passwords do not match
							</p>
						)}
					</div>
					{error && <p className="text-red-500">{error}</p>}
					{successMessage && (
						<p className="text-green-500">{successMessage}</p>
					)}
					<Button
						type="submit"
						className="w-full"
						disabled={!formValid}
					>
						Register
					</Button>
				</form>
			</CardContent>
			<CardFooter className="flex justify-center">
				<p className="text-sm text-gray-600">
					Already have an account?{" "}
					<Link
						href="/login"
						className="text-blue-600 hover:underline"
					>
						Login
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}

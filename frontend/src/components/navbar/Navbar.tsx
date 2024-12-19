"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/utils";
import { Bitcoin, HandCoins } from "lucide-react";

export const Navbar = () => {
	const [currentUser, setCurrentUser] = useState(null as any);
	const [tokenBalance, setTokenBalance] = useState(0);

	useEffect(() => {
		apiFetch("http://localhost:5001/api/users/current").then((userData) => {
			setCurrentUser(userData);
		});
	}, []);

	useEffect(() => {
		if (currentUser) setTokenBalance(currentUser.tokenBalance);
	}, [currentUser]);

	const handleDepositTokens = () => {
		console.log("Deposit");
		// router.push("/buy-tokens");
	};

	const handleWithdrawTokens = () => {
		console.log("Withdraw");
	};

	if (!currentUser) return <div>Loading...</div>;

	return (
		<header className="bg-white shadow-sm sticky top-0 z-10">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
				<Link href="/">
					<h1 className="text-3xl font-bold text-gray-900">
						OnlyCars
					</h1>
				</Link>
				<div className="flex items-center space-x-4">
					<span className="text-sm font-medium text-gray-500">
						Token Balance: {tokenBalance}
					</span>
					<Button
						onClick={handleDepositTokens}
						className="flex gap-2"
					>
						<Bitcoin />
						Deposit
					</Button>
					<Button
						variant="outline"
						onClick={handleWithdrawTokens}
						className="flex gap-2"
					>
						<HandCoins />
						Withdraw
					</Button>
					<Link href={`/${currentUser?.userName}`}>
						<Avatar>
							<AvatarImage
								src={currentUser?.profilePictureUrl}
								alt={currentUser?.userName}
							/>
							<AvatarFallback>
								{currentUser?.userName[0]}
							</AvatarFallback>
						</Avatar>
					</Link>
				</div>
			</div>
		</header>
	);
};

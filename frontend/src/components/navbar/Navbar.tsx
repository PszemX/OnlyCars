/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/utils";

export const Navbar = ({
	tokenBalance,
	onPurchaseTokens,
}: {
	tokenBalance: number;
	onPurchaseTokens: () => void;
}) => {
	const [currentUser, setCurrentUser] = useState(null as any);

	useEffect(() => {
		apiFetch("http://localhost:5001/api/users/current").then((userData) => {
			setCurrentUser(userData);
		});
	}, []);

	if (!currentUser) return <div>Loading...</div>;

	return (
		<header className="bg-white shadow-sm sticky top-0 z-10">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
				<h1 className="text-3xl font-bold text-gray-900">OnlyCars</h1>
				<div className="flex items-center space-x-4">
					<span className="text-sm font-medium text-gray-500">
						Token Balance: {tokenBalance}
					</span>
					<Link href="/buy-tokens">
						<Button variant="outline" onClick={onPurchaseTokens}>
							Buy Tokens
						</Button>
					</Link>
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

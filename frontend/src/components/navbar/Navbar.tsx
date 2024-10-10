import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { users } from "@/data/mockUsers";

export const Navbar = ({
	tokenBalance,
	onPurchaseTokens,
}: {
	tokenBalance: number;
	onPurchaseTokens: () => void;
}) => {
	const [currentUser, setCurrentUser] = useState<{
		name: string;
		avatar: string;
	} | null>(null);

	useEffect(() => {
		const fetchCurrentUser = async () => {
			const user = users[3];
			setCurrentUser(user);
		};

		fetchCurrentUser();
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
					<Link href={`/${currentUser.name}`}>
						<Avatar>
							<AvatarImage
								src={currentUser.avatar}
								alt={currentUser.name}
							/>
							<AvatarFallback>
								{currentUser.name[0]}
							</AvatarFallback>
						</Avatar>
					</Link>
				</div>
			</div>
		</header>
	);
};

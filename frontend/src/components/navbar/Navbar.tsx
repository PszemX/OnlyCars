"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetch } from "@/lib/utils";
import { TokensModal } from "../modals/TokensModal";
import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";

export const Navbar = () => {
	const [currentUser, setCurrentUser] = useState(null as any);
	const [tokenBalance, setTokenBalance] = useState(0);
	const pathname = usePathname();

	useEffect(() => {
		const fetchUser = async () => {
		  const userData = await apiFetch("http://localhost:5001/api/users/current");
		  setCurrentUser(userData);
		  setTokenBalance(userData.tokenBalance);
		};
		fetchUser();
	  }, []); // Empty dependency array - runs once

	return (
		<header className="bg-white shadow-sm sticky top-0 z-10">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
				<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
					<Link href="/">OnlyCars</Link>
					{pathname === "/admin-panel" && <Badge>Admin</Badge>}
				</h1>
				<div className="flex items-center space-x-4">
					<span className="text-sm font-medium text-gray-500">
						Token Balance: {tokenBalance}
					</span>
					<TokensModal />
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

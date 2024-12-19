"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFollowing } from "@/context/FollowingContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/utils";

export const FollowingMenu = () => {
	const { followingUserIds } = useFollowing();
	const [followingUsers, setFollowingUsers] = useState<any[]>([]);

	useEffect(() => {
		// Funkcja pobierająca szczegóły użytkowników na podstawie ich identyfikatorów
		const fetchFollowingUsers = async () => {
			const userDetails = await Promise.all(
				followingUserIds.map((id) =>
					apiFetch(`http://localhost:5001/api/users/${id}`)
				)
			);
			setFollowingUsers(userDetails);
		};

		if (followingUserIds.length > 0) {
			fetchFollowingUsers();
		} else {
			setFollowingUsers([]);
		}
	}, [followingUserIds]);

	return (
		<div className="w-64 bg-white shadow-lg p-4 hidden lg:flex flex-col h-screen fixed top-0 right-0 z-10">
			<h2 className="text-lg font-semibold mb-4">Following</h2>
			<ScrollArea className="flex-grow">
				<div className="space-y-4 pr-4">
					{followingUsers.map((user: any) => (
						<Link
							href={`/${user?.userName}`}
							key={user?.id}
							className="flex items-center space-x-3"
						>
							<Avatar>
								<AvatarImage
									src={
										user?.profilePicture ||
										"/placeholder.svg?height=40&width=40"
									}
									alt={user?.userName}
								/>
								<AvatarFallback>
									{user?.userName?.[0]?.toUpperCase() || "?"}
								</AvatarFallback>
							</Avatar>
							<span className="text-sm font-medium">
								{user?.userName || "Unknown User"}
							</span>
						</Link>
					))}
				</div>
			</ScrollArea>
		</div>
	);
};

// src/context/FollowingContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/utils";

interface FollowingContextType {
	followingUserIds: string[];
	isFollowing: (userId: string) => boolean;
	addFollowingUser: (userId: string) => void;
	removeFollowingUser: (userId: string) => void;
	refreshFollowingUsers: () => void;
}

const FollowingContext = createContext<FollowingContextType | undefined>(
	undefined
);

export const FollowingProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [followingUserIds, setFollowingUserIds] = useState<string[]>([]);

	useEffect(() => {
		const fetchFollowingUsers = async () => {
			const currentUser = await apiFetch(
				"http://localhost:5001/api/users/current"
			);
			if (currentUser) {
				const data = await apiFetch(
					`http://localhost:5001/api/users/${currentUser.id}/following`
				);
				setFollowingUserIds(data.map((user: any) => user.id));
			}
		};
		fetchFollowingUsers();
	}, []);

	const refreshFollowingUsers = async () => {
		const currentUser = await apiFetch(
			"http://localhost:5001/api/users/current"
		);
		if (currentUser) {
			const data = await apiFetch(
				`http://localhost:5001/api/users/${currentUser.id}/following`
			);
			setFollowingUserIds(data.map((user: any) => user.id));
		}
	};

	const isFollowing = (userId: string) => followingUserIds.includes(userId);

	const addFollowingUser = (userId: string) => {
		setFollowingUserIds((prev) => [...prev, userId]);
	};

	const removeFollowingUser = (userId: string) => {
		setFollowingUserIds((prev) => prev.filter((id) => id !== userId));
	};

	return (
		<FollowingContext.Provider
			value={{
				followingUserIds,
				isFollowing,
				addFollowingUser,
				removeFollowingUser,
				refreshFollowingUsers,
			}}
		>
			{children}
		</FollowingContext.Provider>
	);
};

export const useFollowing = () => {
	const context = useContext(FollowingContext);
	if (!context) {
		throw new Error("useFollowing must be used within a FollowingProvider");
	}
	return context;
};

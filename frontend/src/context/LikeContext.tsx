"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/utils";

interface LikeContextType {
	isLiked: (postId: string) => boolean;
	toggleLike: (postId: string) => void;
	refreshLikes: () => void;
}

const LikeContext = createContext<LikeContextType | undefined>(undefined);

export const LikeProvider = ({ children }: { children: React.ReactNode }) => {
	const [likedPostIds, setLikedPostIds] = useState<string[]>([]);

	useEffect(() => {
		const fetchLikedPosts = async () => {
			try {
				const data = await apiFetch(
					"http://localhost:5001/api/users/current"
				);
				setLikedPostIds(data.likedPostIds || []);
			} catch (error) {
				console.error("Failed to fetch liked posts:", error);
			}
		};

		fetchLikedPosts();
	}, []);

	const isLiked = (postId: string) => {
		if (!likedPostIds) return false;
		return likedPostIds.includes(postId);
	};

	const toggleLike = (postId: string) => {
		setLikedPostIds((prev) =>
			isLiked(postId)
				? prev.filter((id) => id !== postId)
				: [...prev, postId]
		);
	};

	const refreshLikes = async () => {
		try {
			const data = await apiFetch(
				"http://localhost:5001/api/posts/liked"
			);
			setLikedPostIds(data.map((post: any) => post.id));
		} catch (error) {
			console.error("Failed to refresh liked posts:", error);
		}
	};

	return (
		<LikeContext.Provider value={{ isLiked, toggleLike, refreshLikes }}>
			{children}
		</LikeContext.Provider>
	);
};

export const useLike = () => {
	const context = useContext(LikeContext);
	if (!context) {
		throw new Error("useLike must be used within a LikeProvider");
	}
	return context;
};
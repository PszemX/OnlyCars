/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/navbar/Navbar";
import { PhotoCard } from "@/components/photo-card/PhotoCard";
import { FloatingMenu } from "@/components/menu/FloatingMenu";
import { FollowingMenu } from "@/components/menu/FollowingMenu";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/utils";

export default function OnlyCars() {
	const authenticated = useAuth();
	const [posts, setPosts] = useState([]);
	const [tokenBalance, setTokenBalance] = useState(0);
	const [unlockedImages, setUnlockedImages] = useState<string[]>([]);
	const [likedPosts, setLikedPosts] = useState<string[]>([]);
	const [following, setFollowing] = useState<string[]>([]);
	const [showAllPosts, setShowAllPosts] = useState(true);
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		if (authenticated) {
			// Fetch current user data
			apiFetch("https://localhost:5001/api/users/current")
				.then((userData) => {
					setTokenBalance(userData.tokenBalance);
					setFollowing(userData.followingUserIds || []);
					setLikedPosts(userData.likedPostIds || []);
					setUnlockedImages(userData.purchasedPostIds || []);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [authenticated]);

	useEffect(() => {
		if (authenticated) {
			// Fetch posts
			const endpoint = showAllPosts
				? "https://localhost:5001/api/posts/all"
				: "https://localhost:5001/api/posts/feed";

			apiFetch(endpoint)
				.then((data) => {
					setPosts(data);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [authenticated, showAllPosts]);

	if (!authenticated) {
		return null;
	}

	const toggleFollow = async (userId: string) => {
		try {
			if (following.includes(userId)) {
				await apiFetch(
					`https://localhost:5001/api/users/${userId}/unfollow`,
					{
						method: "POST",
					}
				);
				setFollowing((prev) => prev.filter((id) => id !== userId));
			} else {
				await apiFetch(
					`https://localhost:5001/api/users/${userId}/follow`,
					{
						method: "POST",
					}
				);
				setFollowing((prev) => [...prev, userId]);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const toggleShowAllPosts = () => {
		setShowAllPosts((prev) => !prev);
	};

	const handleUnlockImage = async (postId: string, price: number) => {
		try {
			const response = await apiFetch(
				`https://localhost:5001/api/posts/${postId}/purchase`,
				{
					method: "POST",
				}
			);

			if (response.message === "Post unlocked.") {
				setUnlockedImages((prev) => [...prev, postId]);
				setTokenBalance((prev) => prev - price);
				toast({
					title: "Image Unlocked!",
					description: `You've successfully unlocked the image for ${price} tokens.`,
					duration: 3000,
				});
			} else {
				throw new Error(response.message || "Unable to unlock image.");
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "An error occurred.",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const handleLikePost = async (postId: string) => {
		try {
			await apiFetch(`https://localhost:5001/api/posts/${postId}/like`, {
				method: "POST",
			});
			setLikedPosts((prev) =>
				prev.includes(postId)
					? prev.filter((id) => id !== postId)
					: [...prev, postId]
			);
		} catch (error) {
			console.error(error);
		}
	};

	const handlePurchaseTokens = () => {
		router.push("/buy-tokens");
	};

	return (
		<>
			<div className="min-h-screen bg-gray-100 flex">
				<div className="flex-grow overflow-y-auto">
					<Navbar
						tokenBalance={tokenBalance}
						onPurchaseTokens={handlePurchaseTokens}
					/>

					<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="flex items-center justify-end mb-4">
							<label className="flex items-center space-x-2">
								<input
									type="checkbox"
									checked={showAllPosts}
									onChange={toggleShowAllPosts}
									className="form-checkbox"
								/>
								<span className="text-sm">
									{showAllPosts
										? "Show All Posts"
										: "Show Followed Posts"}
								</span>
							</label>
						</div>
						<div className="space-y-6">
							{posts.map((post: any) => (
								<PhotoCard
									key={post.id}
									post={post}
									isUnlocked={unlockedImages.includes(
										post.id
									)}
									isLiked={likedPosts.includes(post.id)}
									isFollowing={following.includes(
										post.userId
									)}
									onUnlock={() =>
										handleUnlockImage(post.id, post.price)
									}
									onOpenPost={() => {}}
									onToggleLike={() => handleLikePost(post.id)}
									onToggleFollow={() =>
										toggleFollow(post.userId)
									}
								/>
							))}
						</div>
					</main>

					{/* FloatingMenu component if you have one */}
					<FloatingMenu />
				</div>
				{/* FollowingMenu component if you have one */}
				<FollowingMenu following={following} />
			</div>
			{/* Toaster component if you have one */}
			<Toaster />
		</>
	);
}

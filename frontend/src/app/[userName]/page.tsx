/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/utils";
import { Navbar } from "@/components/navbar/Navbar";
import { PhotoCard } from "@/components/photo-card/PhotoCard";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile({
	params,
}: {
	params: { userName: string };
}) {
	const authenticated = useAuth();
	const [userProfile, setUserProfile] = useState<any>(null);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [tokenBalance, setTokenBalance] = useState(0);
	const [unlockedImages, setUnlockedImages] = useState<string[]>([]);
	const [likedPosts, setLikedPosts] = useState<string[]>([]);
	const [following, setFollowing] = useState<string[]>([]);
	const { toast } = useToast();
	const router = useRouter();

	useEffect(() => {
		if (authenticated) {
			// Fetch current user data
			apiFetch("http://localhost:5001/api/users/current")
				.then((userData) => {
					setTokenBalance(userData.tokenBalance);
					setFollowing(userData.followingUserIds || []);
					setLikedPosts(userData.likedPostIds || []);
					setUnlockedImages(userData.purchasedPostIds || []);
					setCurrentUserId(userData.id);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [authenticated]);

	useEffect(() => {
		if (authenticated) {
			// Fetch the profile data of the user
			apiFetch(
				`http://localhost:5001/api/users/profile/${params.userName}`
			)
				.then((data) => {
					setUserProfile(data);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [authenticated, params.userName]);

	if (!authenticated) {
		return null;
	}

	if (!userProfile) {
		return <div>Loading...</div>;
	}

	const isFollowingUser = following.includes(userProfile.id);
	const isOwnProfile = userProfile.id === currentUserId;

	const handleToggleFollow = async () => {
		try {
			if (isFollowingUser) {
				await apiFetch(
					`http://localhost:5001/api/users/${userProfile.id}/unfollow`,
					{
						method: "POST",
					}
				);
				setFollowing((prev) =>
					prev.filter((userId) => userId !== userProfile.id)
				);
			} else {
				await apiFetch(
					`http://localhost:5001/api/users/${userProfile.id}/follow`,
					{
						method: "POST",
					}
				);
				setFollowing((prev) => [...prev, userProfile.id]);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleUnlockImage = async (postId: string, price: number) => {
		try {
			const response = await apiFetch(
				`http://localhost:5001/api/posts/${postId}/purchase`,
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
			await apiFetch(`http://localhost:5001/api/posts/${postId}/like`, {
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

					<main className="container mx-auto px-4 py-8 max-w-2xl">
						<div className="flex flex-col items-center mb-8 text-center">
							<div className="avatar w-32 h-32 mb-4">
								<Avatar>
									<AvatarImage
										src={
											userProfile.avatarUrl ||
											"/placeholder.svg"
										}
										alt={userProfile.userName}
									/>
									<AvatarFallback>
										{userProfile.userName[0]}
									</AvatarFallback>
								</Avatar>
							</div>
							<h1 className="text-2xl font-bold mb-2">
								{userProfile.userName}
							</h1>
							<p className="text-gray-600 mb-4 max-w-md">
								{userProfile.description ||
									"No description available."}
							</p>
							{!isOwnProfile && (
								<Button
									variant={
										isFollowingUser ? "outline" : "default"
									}
									onClick={handleToggleFollow}
								>
									{isFollowingUser ? "Following" : "Follow"}
								</Button>
							)}
							<div className="flex justify-center space-x-6 mt-4">
								<span>
									<strong>{userProfile.postCount}</strong>{" "}
									posts
								</span>
								<span>
									<strong>
										{userProfile.followersCount}
									</strong>{" "}
									followers
								</span>
								<span>
									<strong>
										{userProfile.followingCount}
									</strong>{" "}
									following
								</span>
							</div>
						</div>

						<div className="space-y-4">
							{userProfile.posts.map((post: any) => (
								<PhotoCard
									key={post.id}
									post={post}
									isUnlocked={unlockedImages.includes(
										post.id
									)}
									isLiked={likedPosts.includes(post.id)}
									isFollowing={isFollowingUser}
									onUnlock={() =>
										handleUnlockImage(post.id, post.price)
									}
									onOpenPost={() => {}}
									onToggleLike={() => handleLikePost(post.id)}
									onToggleFollow={handleToggleFollow}
								/>
							))}
						</div>
					</main>
				</div>
				{/* Toaster component if you have one */}
				<Toaster />
			</div>
		</>
	);
}

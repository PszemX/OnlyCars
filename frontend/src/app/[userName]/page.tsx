/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { PhotoCard } from "@/components/photo-card/PhotoCard";
import { FloatingMenu } from "@/components/menu/FloatingMenu";
import { FollowingMenu } from "@/components/menu/FollowingMenu";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { users } from "@/data/mockUsers";
import { Navbar } from "@/components/navbar/Navbar";
import { Button } from "@/components/ui/button";

export default function UserProfile({
	params,
}: {
	params: { userName: string };
}) {
	const [tokenBalance, setTokenBalance] = useState(100);
	const [unlockedImages, setUnlockedImages] = useState<number[]>([]);
	const [likedPosts, setLikedPosts] = useState<number[]>([]);
	const [following, setFollowing] = useState<string[]>([]);
	const { toast } = useToast();

	const currentUser = users.find((user) => user.name === params.userName);

	if (!currentUser) {
		return <p>User not found</p>;
	}

	const unlockImage = (postId: number, price: number) => {
		if (tokenBalance >= price) {
			setTokenBalance((prev) => prev - price);
			setUnlockedImages((prev) => [...prev, postId]);
			toast({
				title: "Image Unlocked!",
				description: `You've successfully unlocked the image for ${price} tokens.`,
				duration: 3000,
			});
		} else {
			toast({
				title: "Insufficient Tokens",
				description: `You need ${
					price - tokenBalance
				} more tokens to unlock this image.`,
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const toggleLike = (postId: number) => {
		setLikedPosts((prev) =>
			prev.includes(postId)
				? prev.filter((id) => id !== postId)
				: [...prev, postId]
		);
	};

	const toggleFollow = (username: string) => {
		setFollowing((prev) =>
			prev.includes(username)
				? prev.filter((name) => name !== username)
				: [...prev, username]
		);
	};

	const purchaseTokens = () => {
		const amount = 100;
		setTokenBalance((prev) => prev + amount);
		toast({
			title: "Tokens Purchased!",
			description: `You've successfully purchased ${amount} tokens.`,
			duration: 3000,
		});
	};

	return (
		<>
			<div className="min-h-screen bg-gray-100 flex">
				<div className="flex-grow overflow-y-auto">
					<Navbar
						tokenBalance={tokenBalance}
						onPurchaseTokens={purchaseTokens}
					/>

					<main className="container mx-auto px-4 py-8 max-w-2xl">
						<div className="flex flex-col items-center mb-8 text-center">
							<div className="avatar w-32 h-32 mb-4">
								<img
									src={currentUser.avatar}
									alt={currentUser.name}
								/>
							</div>
							<h1 className="text-2xl font-bold mb-2">
								{params.userName}
							</h1>
							<p className="text-gray-600 mb-4 max-w-md">
								{currentUser.description}
							</p>
							<Button
								variant="outline"
								onClick={() => toggleFollow(params.userName)}
							>
								{following.includes(params.userName)
									? "Following"
									: "Follow"}
							</Button>
							<div className="flex justify-center space-x-6 mt-4">
								<span>
									<strong>{currentUser.posts.length}</strong>{" "}
									posts
								</span>
								<span>
									<strong>{currentUser.followers}</strong>{" "}
									followers
								</span>
							</div>
						</div>

						<div className="space-y-4">
							{currentUser.posts.map((post) => (
								<PhotoCard
									key={post.id}
									post={post}
									isUnlocked={unlockedImages.includes(
										post.id
									)}
									isLiked={likedPosts.includes(post.id)}
									isFollowing={following.includes(
										params.userName
									)}
									onUnlock={() =>
										unlockImage(post.id, post.price)
									}
									onOpenPost={() =>
										console.log("Post Opened", post.id)
									}
									onToggleLike={() => toggleLike(post.id)}
									onToggleFollow={() =>
										toggleFollow(params.userName)
									}
								/>
							))}
						</div>
					</main>

					<FloatingMenu />
				</div>
				<FollowingMenu following={following} />
			</div>
			<Toaster />
		</>
	);
}

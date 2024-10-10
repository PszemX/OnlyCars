"use client";

import { useState } from "react";
import { PhotoCard } from "@/components/photo-card/PhotoCard";
import { FloatingMenu } from "@/components/menu/FloatingMenu";
import { FollowingMenu } from "@/components/menu/FollowingMenu";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { users } from "@/data/mockUsers";
import { Navbar } from "@/components/navbar/Navbar"; // Ensure correct path

export default function OnlyCars() {
	const [tokenBalance, setTokenBalance] = useState(100);
	const [unlockedImages, setUnlockedImages] = useState<number[]>([]);
	const [likedPosts, setLikedPosts] = useState<number[]>([]);
	const [following, setFollowing] = useState<string[]>([]);
	const { toast } = useToast();

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

					<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="space-y-6">
							{users.map((user) =>
								user.posts.map((post) => (
									<PhotoCard
										key={post.id}
										post={post}
										isUnlocked={unlockedImages.includes(
											post.id
										)}
										isLiked={likedPosts.includes(post.id)}
										isFollowing={following.includes(
											user.name
										)}
										onUnlock={() =>
											unlockImage(post.id, post.price)
										}
										onOpenPost={() =>
											console.log("Post Opened", post.id)
										}
										onToggleLike={() => toggleLike(post.id)}
										onToggleFollow={() =>
											toggleFollow(user.name)
										}
									/>
								))
							)}
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

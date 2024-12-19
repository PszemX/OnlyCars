"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PhotoCard } from "@/components/photo-card/PhotoCard";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function OnlyCars() {
	const authenticated = useAuth();
	const [posts, setPosts] = useState([]);
	const [unlockedImages, setUnlockedImages] = useState<string[]>([]);
	const [likedPosts, setLikedPosts] = useState<string[]>([]);
	const [showAllPosts, setShowAllPosts] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		if (authenticated) {
			apiFetch("http://localhost:5001/api/users/current")
				.then((userData) => {
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
			const endpoint = showAllPosts
				? "http://localhost:5001/api/posts/all"
				: "http://localhost:5001/api/posts/feed";

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

	const toggleShowAllPosts = () => {
		setShowAllPosts((prev) => !prev);
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

	return (
		<>
			<div className="min-h-screen bg-gray-100 flex">
				<div className="flex-grow overflow-y-auto">
					<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						{/* TODO: FIX THAT LATER */}
						{/* <div className="flex items-center justify-end mb-4">
							<label className="flex items-center space-x-2">
								<Switch
									id="show-all-posts"
									checked={showAllPosts}
									onCheckedChange={toggleShowAllPosts}
								/>
								<Label htmlFor="show-all-posts">
									Show Followed Posts
								</Label>
							</label>
						</div> */}
						<div className="space-y-6">
							{posts.map((post: any) => (
								<PhotoCard
									key={post.id}
									post={post}
									isUnlocked={unlockedImages.includes(
										post.id
									)}
									isLiked={likedPosts.includes(post.id)}
									onUnlock={() =>
										handleUnlockImage(post.id, post.price)
									}
									onOpenPost={() => {}}
									onToggleLike={() => handleLikePost(post.id)}
								/>
							))}
						</div>
					</main>
				</div>
			</div>
			{/* Toaster component if you have one */}
			<Toaster />
		</>
	);
}

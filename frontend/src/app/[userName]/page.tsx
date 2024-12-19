/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { PhotoCard } from "@/components/photo-card/PhotoCard";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowingButton from "@/components/button/FollowingButton";
import { useAuth } from "@/hooks/use-auth";

export default function UserProfile({
	params,
}: {
	params: { userName: string };
}) {
	const authenticated = useAuth();
	const [userId, setUserId] = useState("");
	const [unlockedImages, setUnlockedImages] = useState<number[]>([]);
	const [currentUser, setCurrentUser] = useState({} as any);
	const [currentUserPosts, setCurrentUserPosts] = useState([] as any);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		setLoading(true);
		apiFetch(`http://localhost:5001/api/users/`, {
			method: "GET",
		}).then((allUsers: any) => {
			setCurrentUser(
				allUsers.filter(
					(user: any) => user.userName === params.userName
				)[0]
			);
		});
		setLoading(false);
	}, [params.userName]);

	useEffect(() => {
		if (authenticated) {
			apiFetch("http://localhost:5001/api/users/current")
				.then((userData) => {
					setUserId(userData.id);
					setUnlockedImages(userData.purchasedPostIds || []);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [authenticated]);

	useEffect(() => {
		if (!currentUser || !currentUser.id) return;
		setLoading(true);
		apiFetch(`http://localhost:5001/api/users/${currentUser.id}/posts`, {
			method: "GET",
		}).then((data) => {
			setCurrentUserPosts(
				data.sort(
					(a: any, b: any) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime()
				)
			);
			setLoading(false);
		});
	}, [currentUser]);

	if (!currentUser) {
		return <p>User not found</p>;
	}

	if (loading) {
		return <p>Loading...</p>;
	}

	const handleUnlockImage = async (postId: number, price: number) => {
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
				description: "Not enough tokens!",
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	return (
		<>
			<div className="min-h-screen bg-gray-100 flex">
				<div className="flex-grow overflow-y-auto">
					<main className="container mx-auto px-4 py-8 max-w-2xl">
						<div className="flex flex-col items-center mb-8 text-center">
							{currentUser && (
								<div className="avatar w-32 h-32 mb-4">
									<Avatar className="w-full h-full bg-white border-4 border-white">
										<AvatarImage
											src="/placeholder.svg?height=40&width=40"
											alt={currentUser.userName || "User"}
										/>
										<AvatarFallback className="text-2xl">
											{currentUser?.userName?.[0] || "?"}
										</AvatarFallback>
									</Avatar>
								</div>
							)}
							<h1 className="text-2xl font-bold mb-2">
								{params.userName}
							</h1>
							<p className="text-gray-600 mb-4 max-w-md">
								{currentUser.description}
							</p>
							<FollowingButton
								userId={currentUser.id as string}
							/>
							<div className="flex justify-center space-x-6 mt-4">
								<span>
									<strong>
										{currentUser?.postIds?.length}
									</strong>{" "}
									posts
								</span>
								<span>
									<strong>
										{currentUser?.followerIds?.length}
									</strong>{" "}
									followers
								</span>
							</div>
						</div>

						<div className="space-y-4">
							{currentUserPosts.map((post: any) => (
								<PhotoCard
									key={post.id}
									post={post}
									isUnlocked={
										unlockedImages.includes(post.id) ||
										post.userId === userId
									}
									onUnlock={() =>
										handleUnlockImage(post.id, post.price)
									}
									onOpenPost={() =>
										console.log("Post Opened", post.id)
									}
								/>
							))}
						</div>
					</main>
				</div>
			</div>
			<Toaster />
		</>
	);
}

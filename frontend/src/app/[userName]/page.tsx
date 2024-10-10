/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Heart,
	MessageCircle,
	Send,
	PlusCircle,
	Home,
	User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Link from "next/link";

// Mock user data
const userData = {
	username: "CarEnthusiast",
	avatar: "/placeholder.svg?height=150&width=150",
	posts: 80,
	followers: "119k",
	following: 98,
	description:
		"Passionate about all things automotive. From classic cars to cutting-edge EVs, I love them all! 🚗💨",
};

// Mock post data
const userPosts = [
	{
		id: 1,
		image: "/car.jpg",
		likes: 1234,
		comments: 56,
		price: 50,
		description: "Check out this classic beauty!",
		user: {
			name: "CarEnthusiast",
			avatar: "/placeholder.svg?height=150&width=150",
		},
	},
	{
		id: 2,
		image: "/car.jpg",
		likes: 2345,
		comments: 78,
		price: 75,
		description: "Sleek and modern design",
		user: {
			name: "CarEnthusiast",
			avatar: "/placeholder.svg?height=150&width=150",
		},
	},
	{
		id: 3,
		image: "/car.jpg",
		likes: 3456,
		comments: 90,
		price: 40,
		description: "Vintage charm",
		user: {
			name: "CarEnthusiast",
			avatar: "/placeholder.svg?height=150&width=150",
		},
	},
	{
		id: 4,
		image: "/car.jpg",
		likes: 4567,
		comments: 123,
		price: 60,
		description: "Power and elegance combined",
		user: {
			name: "CarEnthusiast",
			avatar: "/placeholder.svg?height=150&width=150",
		},
	},
	{
		id: 5,
		image: "/car.jpg",
		likes: 5678,
		comments: 234,
		price: 55,
		description: "Off-road adventure ready",
		user: {
			name: "CarEnthusiast",
			avatar: "/placeholder.svg?height=150&width=150",
		},
	},
	{
		id: 6,
		image: "/car.jpg",
		likes: 6789,
		comments: 345,
		price: 70,
		description: "Luxury on wheels",
		user: {
			name: "CarEnthusiast",
			avatar: "/placeholder.svg?height=150&width=150",
		},
	},
];

export default function UserProfile({
	params,
}: {
	params: { userName: string };
}) {
	const [tokenBalance, setTokenBalance] = useState(100);
	const [unlockedImages, setUnlockedImages] = useState<number[]>([]);
	const [selectedPost, setSelectedPost] = useState<any>(null);
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
		const amount = 100; // For simplicity, we're adding a fixed amount of 100 tokens
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
					<header className="bg-white shadow-sm sticky top-0 z-10 mb-8">
						<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
							<h1 className="text-3xl font-bold text-gray-900">
								OnlyCars
							</h1>
							<div className="flex items-center space-x-4">
								<span className="text-sm font-medium text-gray-500">
									Token Balance: {tokenBalance}
								</span>
								<Button
									variant="outline"
									onClick={purchaseTokens}
								>
									Buy Tokens
								</Button>
								<Avatar>
									<AvatarImage
										src="/placeholder.svg?height=40&width=40"
										alt="User"
									/>
									<AvatarFallback>UN</AvatarFallback>
								</Avatar>
							</div>
						</div>
					</header>

					<main className="container mx-auto px-4 py-8 max-w-2xl">
						<div className="flex flex-col items-center mb-8 text-center">
							<Avatar className="w-32 h-32 mb-4">
								<AvatarImage
									src={userData.avatar}
									alt={userData.username}
								/>
								<AvatarFallback>
									{userData.username[0]}
								</AvatarFallback>
							</Avatar>
							<h1 className="text-2xl font-bold mb-2">
								{params.userName}
							</h1>
							<p className="text-gray-600 mb-4 max-w-md">
								{userData.description}
							</p>
							<Button
								variant={
									following.includes(params.userName)
										? "outline"
										: "default"
								}
								className="w-full max-w-xs"
								onClick={() => toggleFollow(params.userName)}
							>
								{following.includes(params.userName)
									? "Following"
									: "Follow"}
							</Button>
							<div className="flex justify-center space-x-6 mt-4">
								<span>
									<strong>{userData.posts}</strong> posts
								</span>
								<span>
									<strong>{userData.followers}</strong>{" "}
									followers
								</span>
								<span>
									<strong>{userData.following}</strong>{" "}
									following
								</span>
							</div>
						</div>

						<div className="space-y-4">
							{userPosts.map((post) => (
								<Card
									key={post.id}
									className={`overflow-hidden ${
										unlockedImages.includes(post.id)
											? "hover:cursor-pointer"
											: ""
									}`}
									onClick={() =>
										unlockedImages.includes(post.id)
											? setSelectedPost(post)
											: ""
									}
								>
									<CardContent className="p-0 relative">
										<img
											src={post.image}
											alt={`Post ${post.id}`}
											className={`w-full h-auto cursor-pointer ${
												!unlockedImages.includes(
													post.id
												)
													? "filter blur-md"
													: ""
											}`}
										/>
										{!unlockedImages.includes(post.id) && (
											<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
												<Button
													onClick={() =>
														unlockImage(
															post.id,
															post.price
														)
													}
												>
													Unlock for {post.price}{" "}
													tokens
												</Button>
											</div>
										)}
										{unlockedImages.includes(post.id) && (
											<div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
												<div className="text-white flex space-x-4">
													<span className="flex items-center">
														<Heart className="mr-2 h-6 w-6" />
														{post.likes +
															(likedPosts.includes(
																post.id
															)
																? 1
																: 0)}
													</span>
													<span className="flex items-center">
														<MessageCircle className="mr-2 h-6 w-6" />
														{post.comments}
													</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					</main>
					<FloatingMenu />
				</div>
				<FollowingMenu following={following} />
			</div>

			{selectedPost && (
				<PostModal
					post={selectedPost}
					isUnlocked={unlockedImages.includes(selectedPost.id)}
					isLiked={likedPosts.includes(selectedPost.id)}
					isFollowing={following.includes(selectedPost.user.name)}
					onClose={() => setSelectedPost(null)}
					onUnlock={() =>
						unlockImage(selectedPost.id, selectedPost.price)
					}
					onToggleLike={() => toggleLike(selectedPost.id)}
					onToggleFollow={() => toggleFollow(selectedPost.user.name)}
				/>
			)}
			<Toaster />
		</>
	);
}

function PostModal({
	post,
	isUnlocked,
	isLiked,
	isFollowing,
	onClose,
	onUnlock,
	onToggleLike,
	onToggleFollow,
}: {
	post: any;
	isUnlocked: boolean;
	isLiked: boolean;
	isFollowing: boolean;
	onClose: () => void;
	onUnlock: () => void;
	onToggleLike: () => void;
	onToggleFollow: () => void;
}) {
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState(
		post.comments
			? [
					{ user: "User1", text: "Great photo!" },
					{ user: "User2", text: "Amazing car!" },
			  ]
			: []
	);

	const addComment = () => {
		if (newComment.trim()) {
			setComments([
				...comments,
				{ user: "You", text: newComment.trim() },
			]);
			setNewComment("");
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[800px] p-0">
				<div className="flex h-[80vh]">
					<div className="w-2/3 bg-black flex items-center justify-center relative">
						<img
							src={post.image}
							alt="Car"
							className={`max-h-full max-w-full object-contain ${
								!isUnlocked ? "filter blur-md" : ""
							}`}
						/>
						{!isUnlocked && (
							<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
								<Button onClick={onUnlock}>
									Unlock for {post.price} tokens
								</Button>
							</div>
						)}
					</div>
					<div className="w-1/3 flex flex-col">
						<DialogHeader className="p-4 border-b">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4">
									<Avatar>
										<AvatarImage
											src={post.user.avatar}
											alt={post.user.name}
										/>
										<AvatarFallback>
											{post.user.name[0]}
										</AvatarFallback>
									</Avatar>
									<DialogTitle className="text-sm font-semibold">
										{post.user.name}
									</DialogTitle>
								</div>
								<Button
									variant={
										isFollowing ? "outline" : "default"
									}
									size="sm"
									onClick={onToggleFollow}
								>
									{isFollowing ? "Following" : "Follow"}
								</Button>
							</div>
						</DialogHeader>
						<ScrollArea className="flex-1 p-4">
							<p className="text-sm mb-4">
								<span className="font-semibold">
									{post.user.name}
								</span>{" "}
								{post.description}
							</p>
							{comments.map((comment: any, index: number) => (
								<div key={index} className="mb-2">
									<p className="text-sm">
										<span className="font-semibold">
											{comment.user}
										</span>{" "}
										{comment.text}
									</p>
								</div>
							))}
						</ScrollArea>
						<div className="p-4 border-t">
							<div className="flex items-center space-x-4 mb-4">
								<Button
									variant="ghost"
									size="icon"
									onClick={onToggleLike}
								>
									<Heart
										className={`h-4 w-4 ${
											isLiked
												? "text-red-500 fill-red-500"
												: ""
										}`}
									/>
								</Button>
								<Button variant="ghost" size="icon">
									<MessageCircle className="h-4 w-4" />
								</Button>
								<Button variant="ghost" size="icon">
									<Send className="h-4 w-4" />
								</Button>
							</div>
							<p className="text-sm font-semibold mb-2">
								{post.likes + (isLiked ? 1 : 0)} likes
							</p>
							<div className="flex items-center">
								<Input
									placeholder="Add a comment..."
									value={newComment}
									onChange={(e) =>
										setNewComment(e.target.value)
									}
									className="flex-1"
								/>
								<Button
									variant="ghost"
									className="ml-2"
									onClick={addComment}
								>
									Post
								</Button>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function FloatingMenu() {
	return (
		<TooltipProvider>
			<div className="fixed bottom-10 left-1/2 z-10 flex w-auto max-w-lg -translate-x-1/2 transform items-center justify-center space-x-3 rounded-2xl bg-gray-800 p-2 shadow-lg">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="text-white"
						>
							<Home className="h-5 w-5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Home</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="text-white"
						>
							<PlusCircle className="h-5 w-5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>New Post</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="text-white"
						>
							<User className="h-5 w-5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Profile</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</TooltipProvider>
	);
}

function FollowingMenu({ following }: { following: string[] }) {
	return (
		<div className="w-64 bg-white shadow-lg p-4 hidden lg:flex flex-col h-screen sticky top-0">
			<h2 className="text-lg font-semibold mb-4">Following</h2>
			<ScrollArea className="flex-grow">
				<div className="space-y-4 pr-4">
					{following.map((username) => (
						<Link
							href={`//${username}`}
							key={username}
							className="flex items-center space-x-3"
						>
							<Avatar>
								<AvatarImage
									src={`/placeholder.svg?height=40&width=40`}
									alt={username}
								/>
								<AvatarFallback>{username[0]}</AvatarFallback>
							</Avatar>
							<span className="text-sm font-medium">
								{username}
							</span>
						</Link>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}

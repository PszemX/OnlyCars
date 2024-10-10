"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
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
import { FileUpload } from "@/components/file-upload/FileUpload";

// Simulated car post data
const carPosts = [
	{
		id: 1,
		user: {
			name: "CarEnthusiast",
			avatar: "/placeholder.svg?height=40&width=40",
		},
		image: "/car.jpg",
		description: "Check out this classic Mustang! 🚗💨",
		likes: 1234,
		comments: [
			{
				user: "MustangLover",
				text: "Absolutely gorgeous! What year is this?",
			},
			{
				user: "VintageCars",
				text: "The lines on this model are timeless.",
			},
		],
		price: 50,
	},
	{
		id: 2,
		user: {
			name: "ElectricDreams",
			avatar: "/placeholder.svg?height=40&width=40",
		},
		image: "/car.jpg",
		description: "Future is here with this sleek Tesla! ⚡🚙",
		likes: 2345,
		comments: [
			{
				user: "TechGeek",
				text: "Those self-driving features are amazing!",
			},
			{ user: "GreenRider", text: "Zero emissions, all the style!" },
		],
		price: 75,
	},
	{
		id: 3,
		user: {
			name: "RetroRides",
			avatar: "/placeholder.svg?height=40&width=40",
		},
		image: "/car.jpg",
		description: "Vintage Beetle vibes! 🐞🚗",
		likes: 3456,
		comments: [
			{
				user: "ClassicLover",
				text: "This brings back so many memories!",
			},
			{ user: "BugFan", text: "The original people's car. Love it!" },
		],
		price: 40,
	},
];

export default function OnlyCars() {
	const [tokenBalance, setTokenBalance] = useState(100);
	const [unlockedImages, setUnlockedImages] = useState<number[]>([]);
	const [selectedPost, setSelectedPost] = useState<any>(null);
	const [likedPosts, setLikedPosts] = useState<number[]>([]);
	const [following, setFollowing] = useState<string[]>([]);
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
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
					<header className="bg-white shadow-sm sticky top-0 z-10">
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
					<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="space-y-6">
							{carPosts.map((post) => (
								<PhotoCard
									key={post.id}
									post={post}
									isUnlocked={unlockedImages.includes(
										post.id
									)}
									isLiked={likedPosts.includes(post.id)}
									isFollowing={following.includes(
										post.user.name
									)}
									onUnlock={() =>
										unlockImage(post.id, post.price)
									}
									onOpenPost={() => setSelectedPost(post)}
									onToggleLike={() => toggleLike(post.id)}
									onToggleFollow={() =>
										toggleFollow(post.user.name)
									}
								/>
							))}
						</div>
					</main>
					<FloatingMenu
						onUploadClick={() => setIsUploadDialogOpen(true)}
					/>
				</div>
				<FollowingMenu following={following} />
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
						onToggleFollow={() =>
							toggleFollow(selectedPost.user.name)
						}
					/>
				)}
			</div>
			<UploadDialog
				open={isUploadDialogOpen}
				onOpenChange={setIsUploadDialogOpen}
			/>
			<Toaster />
		</>
	);
}

function PhotoCard({
	post,
	isUnlocked,
	isLiked,
	isFollowing,
	onUnlock,
	onOpenPost,
	onToggleLike,
	onToggleFollow,
}: {
	post: any;
	isUnlocked: boolean;
	isLiked: boolean;
	isFollowing: boolean;
	onUnlock: () => void;
	onOpenPost: () => void;
	onToggleLike: () => void;
	onToggleFollow: () => void;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center space-x-4 p-4">
				<Link href={`/${post.user.name}`}>
					<Avatar>
						<AvatarImage
							src={post.user.avatar}
							alt={post.user.name}
						/>
						<AvatarFallback>{post.user.name[0]}</AvatarFallback>
					</Avatar>
				</Link>
				<div className="flex-1 flex justify-between items-center">
					<Link href={`/${post.user.name}`}>
						<h2 className="text-sm font-semibold">
							{post.user.name}
						</h2>
					</Link>
					<Button
						variant={isFollowing ? "outline" : "default"}
						size="sm"
						onClick={onToggleFollow}
					>
						{isFollowing ? "Following" : "Follow"}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<div className="relative">
					<img
						src={post.image}
						alt="Car"
						className={`w-full aspect-square object-cover ${
							!isUnlocked ? "filter blur-md" : ""
						}`}
						onClick={isUnlocked ? onOpenPost : undefined}
					/>
					{!isUnlocked && (
						<div className="absolute inset-0 flex items-center justify-center">
							<Button onClick={onUnlock}>
								Unlock for {post.price} tokens
							</Button>
						</div>
					)}
				</div>
			</CardContent>
			<CardFooter className="flex flex-col items-start p-4">
				<div className="flex items-center space-x-4 w-full">
					<Button variant="ghost" size="icon" onClick={onToggleLike}>
						<Heart
							className={`h-4 w-4 ${
								isLiked ? "text-red-500 fill-red-500" : ""
							}`}
						/>
					</Button>
					<Button variant="ghost" size="icon" onClick={onOpenPost}>
						<MessageCircle className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon">
						<Send className="h-4 w-4" />
					</Button>
				</div>
				<p className="text-sm font-semibold mt-2">
					{post.likes + (isLiked ? 1 : 0)} likes
				</p>
				<p className="text-sm mt-1">
					<span className="font-semibold">{post.user.name}</span>{" "}
					{post.description}
				</p>
				<button
					className="text-sm text-gray-500 mt-1"
					onClick={onOpenPost}
				>
					View all {post.comments.length} comments
				</button>
			</CardFooter>
		</Card>
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
	const [comments, setComments] = useState(post.comments);

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
			<DialogContent className="sm:max-w-[800px] p-0 border-none">
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
						<DialogHeader className="p-4">
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
						<div className="p-4">
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

function FloatingMenu({ onUploadClick }: { onUploadClick: () => void }) {
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
							onClick={onUploadClick}
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
							href={`/${username}`}
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

function UploadDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [files, setFiles] = useState<File[]>([]);
	const [description, setDescription] = useState("");
	const { toast } = useToast();

	const handleUpload = () => {
		if (files.length === 0) {
			toast({
				title: "Error",
				description: "Please select an image to upload.",
				variant: "destructive",
			});
			return;
		}

		// Here you would typically send the file and description to your backend
		console.log("Uploading file:", files[0]);
		console.log("Description:", description);

		toast({
			title: "Success",
			description: "Your image has been uploaded successfully!",
		});

		// Reset the form and close the dialog
		setFiles([]);
		setDescription("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Upload a New Image</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<FileUpload
						onChange={(newFiles) => setFiles(newFiles)}
						accept="image/*"
						files={files}
						setFiles={setFiles}
						title="Upload Image"
						description="Drag and drop your image here or click to select"
					/>
					<div className="grid grid-cols-4 items-center gap-4">
						<Input
							id="description"
							className="col-span-4"
							placeholder="Add a description..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="submit" onClick={handleUpload}>
						Upload
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardFooter,
} from "@/components/ui/card";
import { Heart, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { PostModal } from "@/components/posts/PostModal";

interface Post {
	id: number;
	user: {
		name: string;
		avatar: string;
	};
	image: string;
	description: string;
	likes: number;
	comments: { user: string; text: string }[];
	price: number;
}

interface PhotoCardProps {
	post: Post;
	isUnlocked: boolean;
	isLiked: boolean;
	isFollowing: boolean;
	onUnlock: () => void;
	onOpenPost: (post: Post) => void;
	onToggleLike: () => void;
	onToggleFollow: () => void;
}

export const PhotoCard = ({
	post,
	isUnlocked,
	isLiked,
	isFollowing,
	onUnlock,
	onOpenPost,
	onToggleLike,
	onToggleFollow,
}: PhotoCardProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenPost = () => {
		setIsModalOpen(true);
		onOpenPost(post);
	};

	return (
		<>
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
							onClick={isUnlocked ? handleOpenPost : undefined}
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
						<Button
							variant="ghost"
							size="icon"
							onClick={onToggleLike}
						>
							<Heart
								className={`h-4 w-4 ${
									isLiked ? "text-red-500 fill-red-500" : ""
								}`}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleOpenPost}
						>
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
						className="text-sm text-gray-500 mt-1 hover:underline"
						onClick={handleOpenPost}
					>
						View all {post.comments.length} comments
					</button>
				</CardFooter>
			</Card>

			{isModalOpen && (
				<PostModal
					post={post}
					isUnlocked={isUnlocked}
					isLiked={isLiked}
					isFollowing={isFollowing}
					onClose={() => setIsModalOpen(false)}
					onUnlock={onUnlock}
					onToggleLike={onToggleLike}
					onToggleFollow={onToggleFollow}
				/>
			)}
		</>
	);
};

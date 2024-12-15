/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/utils";

interface Post {
	id: string;
	userId: string;
	userName: string;
	userAvatarUrl: string;
	imageUrl: string;
	description: string;
	likes: number;
	comments: { user: string; text: string }[];
	price: number;
}

interface PostModalProps {
	post: Post;
	isUnlocked: boolean;
	isLiked: boolean;
	isFollowing: boolean;
	onClose: () => void;
	onUnlock: () => void;
	onToggleLike: () => void;
	onToggleFollow: () => void;
}

export const PostModal = ({
	post,
	isUnlocked,
	isLiked,
	isFollowing,
	onClose,
	onUnlock,
	onToggleLike,
	onToggleFollow,
}: PostModalProps) => {
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState(post.comments);

	const addComment = async () => {
		if (newComment.trim()) {
			try {
				await apiFetch(
					`http://localhost:5001/api/posts/${post.id}/comment`,
					{
						method: "POST",
						body: JSON.stringify({ text: newComment.trim() }),
					}
				);
				setComments([
					...comments,
					{ user: "You", text: newComment.trim() },
				]);
				setNewComment("");
			} catch (error) {
				console.error(error);
			}
		}
	};

	const handleToggleFollow = async () => {
		try {
			if (isFollowing) {
				await apiFetch(
					`http://localhost:5001/api/users/${post.userId}/unfollow`,
					{
						method: "POST",
					}
				);
			} else {
				await apiFetch(
					`http://localhost:5001/api/users/${post.userId}/follow`,
					{
						method: "POST",
					}
				);
			}
			onToggleFollow();
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[800px] p-0">
				<div className="flex h-[80vh]">
					<div className="w-2/3 bg-black flex items-center justify-center relative">
						<img
							src={post.imageUrl}
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
											src={
												post.userAvatarUrl ||
												"/placeholder.svg"
											}
											alt={post.userName}
										/>
										<AvatarFallback>
											{post.userName[0]}
										</AvatarFallback>
									</Avatar>
									<DialogTitle className="text-sm font-semibold">
										{post.userName}
									</DialogTitle>
								</div>
								<Button
									variant={
										isFollowing ? "outline" : "default"
									}
									size="sm"
									onClick={handleToggleFollow}
								>
									{isFollowing ? "Following" : "Follow"}
								</Button>
							</div>
						</DialogHeader>
						<ScrollArea className="flex-1 p-4">
							<p className="text-sm mb-4">
								<span className="font-semibold">
									{post.userName}
								</span>{" "}
								{post.description}
							</p>
							{comments.map((comment, index) => (
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
};

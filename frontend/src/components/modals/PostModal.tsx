/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/utils";
import FollowingButton from "../button/FollowingButton";
import LikeButton from "../button/LikeButton";

interface PostModalProps {
	post: any;
	isUnlocked: boolean;
	onClose: () => void;
	onUnlock: () => void;
}

export const PostModal = ({
	post,
	isUnlocked,
	onClose,
	onUnlock,
}: PostModalProps) => {
	const [newComment, setNewComment] = useState("");
	const [user, setUser] = useState(null as any);
	const [comments, setComments] = useState([] as any);

	useEffect(() => {
		const fetchUser = async () => {
			apiFetch(`http://localhost:5001/api/users/${post.userId}`, {
				method: "GET",
			}).then((data) => setUser(data));
		};
		fetchUser();
	}, [post.userId, post]);

	useEffect(() => {
		apiFetch(`http://localhost:5001/api/posts/${post.id}/comments`, {
			method: "GET",
		}).then((data) => setComments(data));
	}, [post.id, post.commentIds, comments]);

	const addComment = async () => {
		const trimmedComment = newComment.trim();

		if (!trimmedComment) return;

		try {
			const newCommentData = await apiFetch(
				`http://localhost:5001/api/posts/${post.id}/comment`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text: trimmedComment }),
				}
			);

			setComments((prevComments: any) => [
				...prevComments,
				newCommentData,
			]);

			setNewComment("");
		} catch (error: any) {
			console.error("Error adding comment:", error);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[800px] p-0">
				<div className="flex h-[80vh]">
					<div className="w-2/3 bg-black flex items-center justify-center relative">
						<img
							src={post.imageUrls[0]}
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
											src={user?.profilePictureUrl}
											alt={user?.userName}
										/>
										<AvatarFallback>
											{user?.userName[0]}
										</AvatarFallback>
									</Avatar>
									<DialogTitle className="text-sm font-semibold">
										{user?.userName}
									</DialogTitle>
								</div>
								<FollowingButton userId={user?.id as string} />
							</div>
						</DialogHeader>
						<ScrollArea className="flex-1 p-4">
							<p className="text-sm mb-4">
								<span className="font-semibold">
									{user?.userName}
								</span>{" "}
								{post.description}
							</p>
							{comments.map((comment: any, index: any) => (
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
								<LikeButton postId={post.id} />
								<Button variant="ghost" size="icon">
									<MessageCircle className="h-4 w-4" />
								</Button>
							</div>
							<p className="text-sm font-semibold mb-2">
								{post.likes} likes
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
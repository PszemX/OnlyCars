/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardFooter,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { PostModal } from "@/components/modals/PostModal";
import { apiFetch } from "@/lib/utils";
import FollowingButton from "../button/FollowingButton";
import LikeButton from "../button/LikeButton";

interface PhotoCardProps {
	post: any;
	isUnlocked: boolean;
	onUnlock: () => void;
	onOpenPost: (post: any) => void;
}

export const PhotoCard = ({
	post,
	isUnlocked,
	onUnlock,
	onOpenPost,
}: PhotoCardProps) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [user, setUser] = useState(null as any);
	const handleOpenPost = () => {
		setIsModalOpen(true);
		onOpenPost(post);
	};

	useEffect(() => {
		const fetchUser = async () => {
		  const data = await apiFetch(`http://localhost:5001/api/users/${post.userId}`);
		  setUser(data);
		};
		fetchUser();
	  }, [post.userId]); // Only re-run when post.userId changes
	

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center space-x-4 p-4">
					<Link href={`/${user?.userName}`}>
						<Avatar>
							<AvatarImage
								src={user?.profilePictureUrl}
								alt={user?.userName}
							/>
							<AvatarFallback>{user?.userName[0]}</AvatarFallback>
						</Avatar>
					</Link>
					<div className="flex-1 flex justify-between items-center">
						<Link href={`/${user?.userName}`}>
							<h2 className="text-sm font-semibold">
								{user?.userName}
							</h2>
						</Link>
						<FollowingButton userId={post.userId as string} />
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<div className="relative">
						<img
							src={post.imageUrls[0]}
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
						<LikeButton postId={post.id} />
						<Button
							variant="ghost"
							size="icon"
							onClick={handleOpenPost}
						>
							<MessageCircle className="h-4 w-4" />
						</Button>
					</div>
					<p className="text-sm font-semibold mt-2">
						{post.likes} likes
					</p>
					<p className="text-sm mt-1">
						<span className="font-semibold">{user?.userName}</span>{" "}
						{post.description}
					</p>
					<button
						className="text-sm text-gray-500 mt-1 hover:underline"
						onClick={handleOpenPost}
					>
						View all {post?.commentIds.length} comments
					</button>
				</CardFooter>
			</Card>

			{isModalOpen && (
				<PostModal
					post={post}
					isUnlocked={isUnlocked}
					onClose={() => setIsModalOpen(false)}
					onUnlock={onUnlock}
				/>
			)}
		</>
	);
};

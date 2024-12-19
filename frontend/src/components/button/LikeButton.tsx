import { Heart } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { useLike } from "@/context/LikeContext";
import { apiFetch } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "../ui/toaster";

const LikeButton = ({ postId }: { postId: string }) => {
	const { isLiked, toggleLike } = useLike();
	const { toast } = useToast();

	const onToggleLike = async () => {
		try {
			if (isLiked(postId)) {
				await dislikePost();
			} else {
				await likePost();
			}
			toggleLike(postId);
			//await refreshLikes();
		} catch (error) {
			console.error("Error toggling like:", error);
		}
	};

	const likePost = async () => {
		try {
			await apiFetch(`http://localhost:5001/api/posts/${postId}/like`, {
				method: "POST",
			});
			toast({
				title: "Successfully liked post!",
				duration: 3000,
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	const dislikePost = async () => {
		try {
			await apiFetch(`http://localhost:5001/api/posts/${postId}/like`, {
				method: "DELETE",
			});
			toast({
				title: "Successfully removed like!",
				duration: 3000,
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
				duration: 3000,
			});
		}
	};

	return (
		<div>
			<Button variant="ghost" size="icon" onClick={onToggleLike}>
				<Heart
					className={`h-4 w-4 ${
						isLiked(postId) ? "text-red-500 fill-red-500" : ""
					}`}
				/>
			</Button>
			<Toaster />
		</div>
	);
};

export default LikeButton;

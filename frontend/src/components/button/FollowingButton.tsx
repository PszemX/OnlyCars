"use client";
import { apiFetch } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useFollowing } from "@/context/FollowingContext";

const FollowingButton = ({ userId }: { userId: string }) => {
	const [currentUser, setCurrentUser] = useState(null as any);
	const { isFollowing, addFollowingUser, removeFollowingUser } =
		useFollowing();
	const { toast } = useToast();

	useEffect(() => {
		apiFetch("http://localhost:5001/api/users/current").then((userData) => {
			setCurrentUser(userData);
		});
	}, []);

	const onToggleFollow = async () => {
		if (isFollowing(userId)) {
			await unfollowUser(userId);
		} else {
			await followUser(userId);
		}
	};

	const followUser = async (userId: string) => {
		try {
			await apiFetch(`http://localhost:5001/api/users/follow/${userId}`, {
				method: "POST",
			});
			addFollowingUser(userId);
			toast({
				title: "Succesfully followed user!",
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

	const unfollowUser = async (userId: string) => {
		try {
			await apiFetch(
				`http://localhost:5001/api/users/unfollow/${userId}`,
				{
					method: "POST",
				}
			);
			removeFollowingUser(userId);
			toast({
				title: "Succesfully unfollowed user!",
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
		<div className={`${userId === currentUser?.id ? "hidden" : ""}`}>
			<Button
				variant={isFollowing(userId) ? "outline" : "default"}
				size="sm"
				onClick={onToggleFollow}
			>
				{isFollowing(userId) ? "Following" : "Follow"}
			</Button>
			<Toaster />
		</div>
	);
};

export default FollowingButton;

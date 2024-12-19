"use client";
import { apiFetch } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useFollowing } from "@/context/FollowingContext";
import { useAuth } from "@/hooks/use-auth";

const FollowingButton = ({ userId }: { userId: string }) => {
	const { authenticated } = useAuth();
	const [currentUser, setCurrentUser] = useState(null as any);
	const following = authenticated ? useFollowing() : null;
	const { toast } = useToast();
  
	useEffect(() => {
	  if (!authenticated) return;
	  
	  apiFetch("http://localhost:5001/api/users/current").then((userData) => {
		setCurrentUser(userData);
	  });
	}, [authenticated]);
  
	const onToggleFollow = async () => {
	  if (!following) return;
  
	  if (following.isFollowing(userId)) {
		await unfollowUser(userId);
	  } else {
		await followUser(userId);
	  }
	};
  
	const followUser = async (userId: string) => {
	  if (!following) return;
  
	  try {
		await apiFetch(`http://localhost:5001/api/users/follow/${userId}`, {
		  method: "POST",
		});
		following.addFollowingUser(userId);
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
	  if (!following) return;
  
	  try {
		await apiFetch(`http://localhost:5001/api/users/unfollow/${userId}`, {
		  method: "POST",
		});
		following.removeFollowingUser(userId);
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
  
	if (!authenticated || !following || userId === currentUser?.id) return null;
  
	return (
	  <div>
		<Button
		  variant={following.isFollowing(userId) ? "outline" : "default"}
		  size="sm"
		  onClick={onToggleFollow}
		>
		  {following.isFollowing(userId) ? "Following" : "Follow"}
		</Button>
		<Toaster />
	  </div>
	);
  };

export default FollowingButton;
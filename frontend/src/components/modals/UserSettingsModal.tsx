"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetch } from "@/lib/utils";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const UserSettingsButton = () => {
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [userName, setUserName] = useState("");
	const [description, setDescription] = useState("");
	const [walletAddress, setWalletAddress] = useState("");
	const [password, setPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmNewPassword, setConfirmNewPassword] = useState("");
	const [open, setOpen] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		apiFetch("http://localhost:5001/api/users/current").then(
			(userData: any) => {
				setCurrentUser(userData);
				setUserName(userData.userName);
				setDescription(userData.description);
				setWalletAddress(userData.walletAddress);
			}
		);
	}, []);

	const handleSaveProfile = async () => {
		if (!password) {
			toast({
				title: "Error",
				description: "Password is required to save changes.",
				variant: "destructive",
			});
			return;
		}

		try {
			await apiFetch("http://localhost:5001/api/users/update", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					password,
					userName,
					description,
					walletAddress,
				}),
			});

			toast({
				title: "Success",
				description: "Profile updated successfully!",
			});
			setPassword("");
			setOpen(false);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		}
	};

	const handleChangePassword = async () => {
		if (!password || newPassword !== confirmNewPassword) {
			toast({
				title: "Error",
				description:
					"Passwords do not match or old password is missing.",
				variant: "destructive",
			});
			return;
		}

		try {
			await apiFetch("http://localhost:5001/api/users/update", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					password,
					newPassword,
				}),
			});

			toast({
				title: "Success",
				description: "Password changed successfully!",
			});
			setPassword("");
			setNewPassword("");
			setConfirmNewPassword("");
			setOpen(false);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message,
				variant: "destructive",
			});
		}
	};

	if (!currentUser) {
		return "Loading...";
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="text-white">
					<Settings className="h-5 w-5" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>User Settings</DialogTitle>
					<DialogDescription>
						{
							"Make changes to your profile here. Click save when you're done."
						}
					</DialogDescription>
				</DialogHeader>
				<Tabs defaultValue="profile" className="w-full">
					<TabsList className="w-full">
						<TabsTrigger value="profile" className="w-full">
							Profile
						</TabsTrigger>
						<TabsTrigger value="password" className="w-full">
							Change Password
						</TabsTrigger>
					</TabsList>
					<TabsContent value="profile">
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="userName"
									className="text-right"
								>
									User name
								</Label>
								<Input
									id="userName"
									value={userName}
									onChange={(e) =>
										setUserName(e.target.value)
									}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="description"
									className="text-right"
								>
									Description
								</Label>
								<Input
									id="description"
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="walletAddress"
									className="text-right"
								>
									Wallet address
								</Label>
								<Input
									id="walletAddress"
									value={walletAddress}
									onChange={(e) =>
										setWalletAddress(e.target.value)
									}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="password"
									className="text-right"
								>
									Password
								</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className="col-span-3"
									required
								/>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={handleSaveProfile}>
								Save changes
							</Button>
						</DialogFooter>
					</TabsContent>
					<TabsContent value="password">
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="password"
									className="text-right"
								>
									Current Password
								</Label>
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									className="col-span-3"
									required
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="newPassword"
									className="text-right"
								>
									New Password
								</Label>
								<Input
									id="newPassword"
									type="password"
									value={newPassword}
									onChange={(e) =>
										setNewPassword(e.target.value)
									}
									className="col-span-3"
								/>
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label
									htmlFor="confirmNewPassword"
									className="text-right"
								>
									Confirm New Password
								</Label>
								<Input
									id="confirmNewPassword"
									type="password"
									value={confirmNewPassword}
									onChange={(e) =>
										setConfirmNewPassword(e.target.value)
									}
									className="col-span-3"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button onClick={handleChangePassword}>
								Change Password
							</Button>
						</DialogFooter>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

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
	const [newPasswordStrength, setNewPasswordStrength] = useState(0);
	const [newPasswordsMatch, setNewPasswordsMatch] = useState(true);
	const [formValid, setFormValid] = useState(false);
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

	useEffect(() => {
		checkNewPasswordStrength(newPassword);
		setNewPasswordsMatch(newPassword === confirmNewPassword);
		setFormValid(
			password !== "" &&
				newPassword !== "" &&
				confirmNewPassword !== "" &&
				newPassword === confirmNewPassword
		);
	}, [password, newPassword, confirmNewPassword]);

	const checkNewPasswordStrength = (newPassword: string) => {
		let strength = 0;
		if (newPassword.length > 6) strength += 1;
		if (/[a-z]/.test(newPassword)) strength += 1;
		if (/[A-Z]/.test(newPassword)) strength += 1;
		if (/[0-9]/.test(newPassword)) strength += 1;
		if (/[$@#&!]/.test(newPassword)) strength += 1;
		setNewPasswordStrength((strength / 5) * 100);
	};

	const getPasswordStrengthColor = () => {
		if (newPasswordStrength <= 33) return "bg-red-500";
		if (newPasswordStrength <= 66) return "bg-orange-500";
		return "bg-green-500";
	};

	const getPasswordStrengthText = () => {
		if (newPasswordStrength <= 33) return "Weak";
		if (newPasswordStrength <= 66) return "Medium";
		return "Strong";
	};

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
			const formData = new FormData();
			formData.append('password', password);
        	if (userName) formData.append('userName', userName);
        	if (description) formData.append('description', description);
        	if (walletAddress) formData.append('walletAddress', walletAddress);

			await apiFetch("http://localhost:5001/api/users/update", {
				method: "PATCH",
				body: formData,
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
			const formData = new FormData();
			formData.append('password', password);
			formData.append('newPassword', newPassword);

			await apiFetch("http://localhost:5001/api/users/update", {
				method: "PATCH",
				body: formData,
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
							<div className="space-y-2">
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
							<div className="space-y-2">
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
							<div className="space-y-2">
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
							<div className="space-y-2">
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
							<Button
								onClick={handleSaveProfile}
								disabled={!password}
							>
								Save changes
							</Button>
						</DialogFooter>
					</TabsContent>
					<TabsContent value="password">
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
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
							<div className="space-y-2">
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
								{newPassword && (
									<div className="space-y-1">
										<div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
											<div
												className={`h-full ${getPasswordStrengthColor()}`}
												style={{
													width: `${newPasswordStrength}%`,
												}}
											></div>
										</div>
										<p className="text-sm text-gray-600">
											Password strength:{" "}
											{getPasswordStrengthText()}
										</p>
									</div>
								)}
							</div>
							<div className="space-y-2">
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
								{!newPasswordsMatch && confirmNewPassword && (
									<p className="text-sm text-red-500">
										Passwords do not match
									</p>
								)}
							</div>
						</div>
						<DialogFooter>
							<Button
								onClick={handleChangePassword}
								disabled={!formValid}
							>
								Change Password
							</Button>
						</DialogFooter>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

"use client";

import { useEffect, useState } from "react";
import { PlusCircle, Home, LogOut, SquareMenu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/file-upload/UploadDialog";
import {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { apiFetch } from "@/lib/utils";
import Cookies from "js-cookie";
import { UserSettingsButton } from "../modals/UserSettingsModal";
import { useAuth } from "@/hooks/use-auth";

export const FloatingMenu = () => {
	const { isAdmin } = useAuth();
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState("" as any);

	useEffect(() => {
		apiFetch("http://localhost:5001/api/users/current").then(
			(userData: any) => {
				setCurrentUser(userData);
			}
		);
	}, []);

	const handleLogout = () => {
		Cookies.remove("token");
		setCurrentUser(null);
		window.location.href = "/login";
	};

	if (!currentUser) {
		return null;
	}

	return (
		<TooltipProvider>
			<div className="fixed bottom-10 left-1/2 z-10 flex w-auto max-w-lg -translate-x-1/2 transform items-center justify-center space-x-3 rounded-2xl bg-gray-800 p-2 shadow-lg">
				{isAdmin && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Link href="/admin-panel">
								<Button
									variant="ghost"
									size="icon"
									className="text-white"
								>
									<SquareMenu className="h-5 w-5" />
								</Button>
							</Link>
						</TooltipTrigger>
						<TooltipContent>
							<p>Admin Panel</p>
						</TooltipContent>
					</Tooltip>
				)}
				<Tooltip>
					<TooltipTrigger asChild>
						<Link href="/">
							<Button
								variant="ghost"
								size="icon"
								className="text-white"
							>
								<Home className="h-5 w-5" />
							</Button>
						</Link>
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
							onClick={() => setIsUploadDialogOpen(true)}
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
						<UserSettingsButton />
					</TooltipTrigger>
					<TooltipContent>
						<p>Settings</p>
					</TooltipContent>
				</Tooltip>

				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="text-white"
							onClick={handleLogout}
						>
							<LogOut className="h-5 w-5" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Logout</p>
					</TooltipContent>
				</Tooltip>
			</div>

			<UploadDialog
				open={isUploadDialogOpen}
				onOpenChange={setIsUploadDialogOpen}
			/>
		</TooltipProvider>
	);
};

import { useState } from "react";
import { PlusCircle, Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDialog } from "@/components/file-upload/UploadDialog";
import {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import Link from "next/link";

export const FloatingMenu = () => {
	const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

	return (
		<TooltipProvider>
			<div className="fixed bottom-10 left-1/2 z-10 flex w-auto max-w-lg -translate-x-1/2 transform items-center justify-center space-x-3 rounded-2xl bg-gray-800 p-2 shadow-lg">
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
						<Link href="/my-page">
							<Button
								variant="ghost"
								size="icon"
								className="text-white"
							>
								<User className="h-5 w-5" />
							</Button>
						</Link>
					</TooltipTrigger>
					<TooltipContent>
						<p>Profile</p>
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

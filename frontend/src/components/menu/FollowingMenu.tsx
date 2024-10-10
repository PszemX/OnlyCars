import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface FollowingMenuProps {
	following: string[];
}

export const FollowingMenu = ({ following }: FollowingMenuProps) => {
	return (
		<div className="w-64 bg-white shadow-lg p-4 hidden lg:flex flex-col h-screen sticky top-0">
			<h2 className="text-lg font-semibold mb-4">Following</h2>
			<ScrollArea className="flex-grow">
				<div className="space-y-4 pr-4">
					{following.map((username) => (
						<Link
							href={`/${username}`}
							key={username}
							className="flex items-center space-x-3"
						>
							<Avatar>
								<AvatarImage
									src="/placeholder.svg?height=40&width=40"
									alt={username}
								/>
								<AvatarFallback>{username[0]}</AvatarFallback>
							</Avatar>
							<span className="text-sm font-medium">
								{username}
							</span>
						</Link>
					))}
				</div>
			</ScrollArea>
		</div>
	);
};

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Coins, Info } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BuyTokensPage() {
	const [tokenAmount, setTokenAmount] = useState(100);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const ethPrice = 0.0005;
	const totalCost = tokenAmount * ethPrice;

	const handlePurchase = async () => {
		setIsLoading(true);
		// Simulating a purchase transaction
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsLoading(false);
		toast({
			title: "Purchase Successful!",
			description: `You have successfully purchased ${tokenAmount} tokens.`,
			duration: 5000,
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl font-bold">
						Buy OnlyCars Tokens
					</CardTitle>
					<CardDescription>
						Purchase tokens to unlock exclusive car content
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="token-amount">Number of Tokens</Label>
						<div className="flex items-center space-x-4">
							<Slider
								id="token-amount"
								min={10}
								max={1000}
								step={10}
								value={[tokenAmount]}
								onValueChange={(value) =>
									setTokenAmount(value[0])
								}
								className="flex-grow"
							/>
							<Input
								type="number"
								value={tokenAmount}
								onChange={(e) =>
									setTokenAmount(Number(e.target.value))
								}
								className="w-20"
							/>
						</div>
					</div>
					<div className="p-4 bg-gray-100 rounded-lg space-y-2">
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">
								Price per token:
							</span>
							<span className="font-medium">{ethPrice} ETH</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm text-gray-600">
								Total cost:
							</span>
							<span className="font-medium">
								{totalCost.toFixed(4)} ETH
							</span>
						</div>
					</div>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center space-x-2 text-sm text-blue-500">
									<Info size={16} />
									<span>Why use Ethereum?</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>
								<p>
									Ethereum provides secure and decentralized
									transactions for purchasing tokens.
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</CardContent>
				<CardFooter>
					<Button
						className="w-full"
						onClick={handlePurchase}
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="flex items-center justify-center">
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
								Processing...
							</div>
						) : (
							<>
								<Coins className="mr-2 h-4 w-4" />
								Purchase Tokens
							</>
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

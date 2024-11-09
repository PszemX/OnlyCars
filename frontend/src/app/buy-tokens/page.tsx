/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/utils";
import { Navbar } from "@/components/navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BuyTokensPage() {
	const authenticated = useAuth();
	const [tokenAmount, setTokenAmount] = useState(100);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	if (!authenticated) {
		return null;
	}

	const handlePurchase = async () => {
		setIsLoading(true);
		try {
			await apiFetch("https://localhost:5001/api/users/purchase-tokens", {
				method: "POST",
				body: JSON.stringify({ amount: tokenAmount }),
			});
			toast({
				title: "Purchase Successful!",
				description: `You have successfully purchased ${tokenAmount} tokens.`,
				duration: 5000,
			});
			router.push("/");
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "An error occurred.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Navbar tokenBalance={0} onPurchaseTokens={() => {}} />
			<div className="container mx-auto px-4 py-8 max-w-md">
				<h1 className="text-2xl font-bold mb-4">Buy Tokens</h1>
				<div className="space-y-4">
					<div className="space-y-2">
						<label
							htmlFor="tokenAmount"
							className="block text-sm font-medium"
						>
							Token Amount
						</label>
						<Input
							id="tokenAmount"
							type="number"
							value={tokenAmount}
							onChange={(e) =>
								setTokenAmount(Number(e.target.value))
							}
							min={1}
						/>
					</div>
					<Button onClick={handlePurchase} disabled={isLoading}>
						{isLoading ? "Processing..." : "Purchase Tokens"}
					</Button>
				</div>
			</div>
		</>
	);
}

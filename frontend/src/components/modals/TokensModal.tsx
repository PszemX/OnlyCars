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
import { Bitcoin, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "../ui/slider";

export const TokensModal = () => {
	const [currentWalletBalance, setCurrentWalletBalance] = useState(undefined);
	const [currentSiteBalance, setCurrentSiteBalance] = useState(undefined);
	const [tokenAmount, setTokenAmount] = useState(0);
	const [privateKey, setPrivateKey] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [open, setOpen] = useState(false);
	const { toast } = useToast();

	const refreshBalances = async () => {
		try {
			const walletBalance = await apiFetch(
				"http://localhost:5001/api/tokens/user-wallet-balance"
			);
			const siteBalance = await apiFetch(
				"http://localhost:5001/api/tokens/user-site-balance"
			);
			setCurrentWalletBalance(walletBalance.balance);
			setCurrentSiteBalance(siteBalance.balance);
		} catch (error) {
			console.error("Error refreshing balances:", error);
		}
	};

	useEffect(() => {
		refreshBalances();
	}, []);

	const handleDeposit = async () => {
		setIsLoading(true);
		try {
			await apiFetch(`http://localhost:5001/api/tokens/deposit`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					privateKey: privateKey,
					amount: tokenAmount,
				}),
			});
			await refreshBalances();
			toast({
				title: "Deposit Successful!",
				description: `You have successfully deposited ${tokenAmount} tokens.`,
				duration: 5000,
			});
			setOpen(false);
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

	const handleWithdraw = async () => {
		setIsLoading(true);
		try {
			await apiFetch(`http://localhost:5001/api/tokens/withdraw`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(tokenAmount),
			});
			await refreshBalances();
			toast({
				title: "Withdraw Successful!",
				description: `You have successfully withdrawn ${tokenAmount} tokens.`,
				duration: 5000,
			});
			setOpen(false);
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

	if (
		currentWalletBalance === undefined ||
		currentSiteBalance === undefined
	) {
		return "Loading...";
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="flex gap-2">
					<Bitcoin />
					Tokens
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Tokens management</DialogTitle>
					<DialogDescription>
						You can freely deposit or withdraw tokens. <br /> More
						money - more fun !
					</DialogDescription>
				</DialogHeader>
				<Tabs defaultValue="profile" className="w-full">
					<TabsList className="w-full">
						<TabsTrigger value="deposit" className="w-full">
							Deposit
						</TabsTrigger>
						<TabsTrigger value="withdraw" className="w-full">
							Withdraw
						</TabsTrigger>
					</TabsList>
					<TabsContent value="deposit">
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="token-amount">
									Number of Tokens
								</Label>
								<div className="flex items-center space-x-4">
									<Slider
										id="token-amount"
										min={0}
										max={currentWalletBalance}
										step={1}
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
											setTokenAmount(
												Number(e.target.value)
											)
										}
										className="w-20"
									/>
								</div>
							</div>
							<Label htmlFor="private-key">Private Key</Label>
							<Input
								type="text"
								value={privateKey}
								onChange={(e) =>
									setPrivateKey(String(e.target.value))
								}
								className="w-full"
								style={{ marginTop: 8 }}
							/>
						</div>
						<DialogFooter>
							<Button
								className="w-full"
								onClick={handleDeposit}
								disabled={
									isLoading || !tokenAmount || !privateKey
								}
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
										Processing...
									</div>
								) : (
									<>
										<Coins className="mr-2 h-4 w-4" />
										Deposit Tokens
									</>
								)}
							</Button>
						</DialogFooter>
					</TabsContent>
					<TabsContent value="withdraw">
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="token-amount">
									Number of Tokens
								</Label>
								<div className="flex items-center space-x-4">
									<Slider
										id="token-amount"
										min={0}
										max={currentSiteBalance}
										step={1}
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
											setTokenAmount(
												Number(e.target.value)
											)
										}
										className="w-20"
									/>
								</div>
							</div>
							{/* <Label htmlFor="private-key">Private Key</Label>
							<Input
								type="text"
								value={privateKey}
								onChange={(e) =>
									setPrivateKey(String(e.target.value))
								}
								className="w-full"
								style={{ marginTop: 8 }}
							/> */}
						</div>
						<DialogFooter>
							<Button
								className="w-full"
								onClick={handleWithdraw}
								disabled={isLoading || !tokenAmount}
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
										Processing...
									</div>
								) : (
									<>
										<Coins className="mr-2 h-4 w-4" />
										Withdraw Tokens
									</>
								)}
							</Button>
						</DialogFooter>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

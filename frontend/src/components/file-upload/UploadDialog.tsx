import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "./FileUpload";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UploadDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [files, setFiles] = useState<File[]>([]);
	const [description, setDescription] = useState("");
	const [tokenAmount, setTokenAmount] = useState<number>(0);
	const { toast } = useToast();

	const handleUpload = () => {
		if (files.length === 0) {
			toast({
				title: "Error",
				description: "Please select an image to upload.",
				variant: "destructive",
			});
			return;
		}

		if (tokenAmount <= 0) {
			toast({
				title: "Error",
				description: "Please enter a valid token amount.",
				variant: "destructive",
			});
			return;
		}

		console.log("Uploading file:", files[0]);
		console.log("Description:", description);
		console.log("Token Amount:", tokenAmount);

		toast({
			title: "Success",
			description: "Your image has been uploaded successfully!",
		});

		setFiles([]);
		setDescription("");
		setTokenAmount(0);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Upload a New Image</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<FileUpload
						onChange={(newFiles) => setFiles(newFiles)}
						accept="image/*"
						files={files}
						setFiles={setFiles}
						title="Upload Image"
						description="Drag and drop your image here or click to select"
					/>

					<div>
						<label
							htmlFor="description"
							className="block text-sm font-medium text-gray-700"
						>
							Description:
						</label>
						<Input
							id="description"
							className="mt-1"
							placeholder="Add a description..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>

					<div>
						<label
							htmlFor="tokenAmount"
							className="block text-sm font-medium text-gray-700"
						>
							Token Amount:
						</label>
						<Input
							type="number"
							id="tokenAmount"
							className="mt-1"
							value={tokenAmount}
							onChange={(e) =>
								setTokenAmount(Number(e.target.value))
							}
							min="1"
							required
							placeholder="Enter the number of tokens"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						type="button"
						onClick={handleUpload}
						disabled={files.length === 0 || tokenAmount <= 0}
					>
						Upload
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

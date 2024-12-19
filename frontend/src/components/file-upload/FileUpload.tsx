/* eslint-disable @typescript-eslint/no-unused-expressions */
import { IconUpload } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { Trash } from "lucide-react";
import React, { useRef } from "react";
import { useDropzone } from "react-dropzone";

import { cn } from "@/lib/utils";

const mainVariant = {
	initial: {
		x: 0,
		y: 0,
	},
	animate: {
		x: 20,
		y: -20,
		opacity: 0.9,
	},
};

const secondaryVariant = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
	},
};

interface FileUploadProps {
	onChange?: (files: File[]) => void;
	accept?: string | string[];
	title?: string;
	description?: string;
	files: File[];
	setFiles: React.Dispatch<React.SetStateAction<File[]>>;
	rejectedFiles?: File[];
	setRejectedFiles?: React.Dispatch<React.SetStateAction<File[]>>;
}

export const FileUpload = ({
	onChange,
	accept,
	title = "Upload file",
	description = "Drag or drop your files here or click to upload",
	files,
	setFiles,
	rejectedFiles: rejectedFilesProp,
	setRejectedFiles: setRejectedFilesProp,
}: FileUploadProps) => {
	const [rejectedFilesState, setRejectedFilesState] = React.useState<File[]>(
		[]
	);
	const rejectedFiles = rejectedFilesProp ?? rejectedFilesState;
	const setRejectedFiles = setRejectedFilesProp ?? setRejectedFilesState;

	const fileInputRef = useRef<HTMLInputElement>(null);

	const isFileTypeAccepted = (
		file: File,
		accept: string | string[] | undefined
	): boolean => {
		if (!accept) return true;
		const mimeType = file.type;
		const baseMimeType = mimeType.replace(/\/.*$/, "");

		const acceptList = Array.isArray(accept)
			? accept
			: accept.split(",").map((type) => type.trim());

		return acceptList.some((type) => {
			if (type === mimeType) {
				return true;
			}
			if (type.endsWith("/*")) {
				const baseType = type.replace(/\/.*$/, "");
				if (baseType === baseMimeType) {
					return true;
				}
			}
			if (type.startsWith(".")) {
				return file.name.toLowerCase().endsWith(type.toLowerCase());
			}
			return false;
		});
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newFiles = Array.from(e.target.files || []);
		processFiles(newFiles);
	};

	const processFiles = (newFiles: File[]) => {
		const acceptedFiles: File[] = [];
		const rejectedFilesList: File[] = [];

		newFiles.forEach((file) => {
			const isAccepted = isFileTypeAccepted(file, accept);
			if (isAccepted) {
				acceptedFiles.push(file);
			} else {
				rejectedFilesList.push(file);
			}
		});

		setFiles(acceptedFiles);
		setRejectedFiles(rejectedFilesList);
		onChange && onChange(acceptedFiles);
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const getAcceptObj = (accept?: string | string[]) => {
		if (!accept) return undefined;
		const acceptList = Array.isArray(accept) ? accept : accept.split(",");
		const acceptObj: { [key: string]: string[] } = {};
		acceptList.forEach((type) => {
			acceptObj[type.trim()] = [];
		});
		return acceptObj;
	};

	const { getRootProps, isDragActive } = useDropzone({
		multiple: false,
		noClick: true,
		accept: getAcceptObj(accept),
		onDrop: (acceptedFiles, fileRejections) => {
			processFiles([
				...acceptedFiles,
				...fileRejections.map((fr) => fr.file),
			]);
		},
		onDropRejected: (fileRejections) => {
			const rejected = fileRejections.map((fr) => fr.file);
			setFiles([]);
			setRejectedFiles(rejected);
			onChange && onChange([]);
		},
	});

	const removeFile = (fileToRemove: File, isRejected: boolean) => {
		if (isRejected) {
			setRejectedFiles((prevFiles) =>
				prevFiles.filter((file) => file !== fileToRemove)
			);
		} else {
			setFiles((prevFiles) =>
				prevFiles.filter((file) => file !== fileToRemove)
			);
			onChange && onChange(files.filter((file) => file !== fileToRemove));
		}
	};

	const renderFileCard = (file: File, isRejected: boolean, idx: number) => (
		<motion.div
			key={isRejected ? "rejected-file" + idx : "file" + idx}
			layoutId={
				idx === 0
					? isRejected
						? "rejected-file-upload"
						: "file-upload"
					: isRejected
					? "rejected-file-upload-" + idx
					: "file-upload-" + idx
			}
			className={cn(
				"relative z-40 mx-auto mt-4 flex w-full flex-col items-start justify-start overflow-hidden rounded-md p-4 md:h-24",
				"shadow-sm",
				isRejected
					? "bg-red-50 dark:bg-red-900"
					: "bg-white dark:bg-neutral-900"
			)}
		>
			<div className="flex w-full items-center justify-between gap-4">
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					layout
					className={cn(
						"max-w-xs truncate text-base",
						isRejected
							? "text-red-700 dark:text-red-300"
							: "text-neutral-700 dark:text-neutral-300"
					)}
				>
					{file.name}
				</motion.p>
				<div className="flex items-center gap-2">
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						layout
						className={cn(
							"flex-shrink-0 rounded-lg px-2 py-1 text-sm shadow-input",
							isRejected
								? "text-red-600 dark:bg-red-800 dark:text-red-200"
								: "text-neutral-600 dark:bg-neutral-800 dark:text-white"
						)}
					>
						{(file.size / (1024 * 1024)).toFixed(2)} MB
					</motion.p>
					<button
						type="button"
						onClick={() => removeFile(file, isRejected)}
						className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
					>
						<Trash className="h-5 w-5" />
					</button>
				</div>
			</div>

			<div className="mt-2 flex w-full flex-col items-start justify-between text-sm md:flex-row md:items-center">
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					layout
					className={cn(
						"rounded-md px-1 py-0.5",
						isRejected
							? "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-400"
							: "bg-gray-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
					)}
				>
					{file.type || "Unknown type"}
				</motion.p>

				{isRejected ? (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						layout
						className="text-red-600 dark:text-red-400"
					>
						File type not accepted
					</motion.p>
				) : (
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						layout
						className="text-neutral-600 dark:text-neutral-400"
					>
						Modified{" "}
						{new Date(file.lastModified).toLocaleDateString()}
					</motion.p>
				)}
			</div>
		</motion.div>
	);

	return (
		<div className="w-full" {...getRootProps()}>
			<motion.div
				onClick={handleClick}
				whileHover="animate"
				className="group/file relative block w-full cursor-pointer overflow-hidden rounded-lg p-10"
			>
				<input
					ref={fileInputRef}
					id="file-upload-handle"
					type="file"
					onChange={handleFileChange}
					accept={Array.isArray(accept) ? accept.join(",") : accept}
					className="hidden"
				/>
				<div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
					<GridPattern />
				</div>
				<div className="flex flex-col items-center justify-center">
					<p className="relative z-20 font-sans text-base font-bold text-neutral-700 dark:text-neutral-300">
						{title}
					</p>
					<p className="relative z-20 mt-2 font-sans text-base font-normal text-neutral-400 dark:text-neutral-400">
						{description}
					</p>
					<div className="relative mx-auto mt-10 w-full max-w-xl">
						{files.length > 0 &&
							files.map((file, idx) =>
								renderFileCard(file, false, idx)
							)}
						{rejectedFiles.length > 0 &&
							rejectedFiles.map((file, idx) =>
								renderFileCard(file, true, idx)
							)}

						{!files.length && !rejectedFiles.length && (
							<motion.div
								layoutId="file-upload"
								variants={mainVariant}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
								className={cn(
									"relative z-40 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md bg-white group-hover/file:shadow-2xl dark:bg-neutral-900",
									"shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
								)}
							>
								{isDragActive ? (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="flex flex-col items-center text-neutral-600"
									>
										Drop it
										<IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
									</motion.p>
								) : (
									<IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
								)}
							</motion.div>
						)}

						{!files.length && !rejectedFiles.length && (
							<motion.div
								variants={secondaryVariant}
								className="absolute inset-0 z-30 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md border border-dashed border-sky-400 bg-transparent opacity-0"
							></motion.div>
						)}
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export function GridPattern() {
	const columns = 41;
	const rows = 11;
	return (
		<div className="flex flex-shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px bg-gray-100 dark:bg-neutral-900">
			{Array.from({ length: rows }).map((_, row) =>
				Array.from({ length: columns }).map((_, col) => {
					const index = row * columns + col;
					return (
						<div
							key={`${col}-${row}`}
							className={`flex h-10 w-10 flex-shrink-0 rounded-[2px] ${
								index % 2 === 0
									? "bg-gray-50 dark:bg-neutral-950"
									: "bg-gray-50 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:bg-neutral-950 dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
							}`}
						/>
					);
				})
			)}
		</div>
	);
}

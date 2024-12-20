"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import UnauthorizedPage from "./UnAuthorizedPage";

export type User = {
	userId: string;
	userName: string;
	walletAddress: string | null;
	walletBalance: number | null;
};

const AdminPanelPage = () => {
	const { isAdmin } = useAuth();
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] =
		React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [users, setUsers] = React.useState<User[]>([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const router = useRouter();

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "userName",
			header: ({ column }) => (
				<Button
					variant="ghost"
					onClick={() =>
						column.toggleSorting(column.getIsSorted() === "asc")
					}
				>
					User Name
					<ArrowUpDown />
				</Button>
			),
			cell: ({ row }) => <div>{row.getValue("userName")}</div>,
		},
		{
			accessorKey: "walletAddress",
			header: () => <div>Wallet Address</div>,
			cell: ({ row }) => (
				<div className="lowercase">
					{row.getValue("walletAddress") || "Not provided"}
				</div>
			),
		},
		{
			accessorKey: "walletBalance",
			header: () => <div>Wallet Balance</div>,
			cell: ({ row }) => {
				const balance = row.getValue("walletBalance");
				return (
					<div className="font-medium">
						{balance !== null
							? new Intl.NumberFormat("en-US", {
									style: "currency",
									currency: "OCT",
							  }).format(balance)
							: "N/A"}
					</div>
				);
			},
		},
		{
			id: "actions",
			enableHiding: false,
			cell: ({ row }) => {
				const user = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem
								onClick={() =>
									navigator.clipboard.writeText(user.userId)
								}
							>
								Copy User ID
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => router.push(`/${user.userName}`)}
							>{`Visit ${user.userName}'s page`}</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	React.useEffect(() => {
		setIsLoading(true);
		apiFetch("http://localhost:5001/api/tokens/users-wallet-balances", {
			method: "GET",
		}).then((data) => setUsers(data));
		setIsLoading(false);
	}, []);

	const table = useReactTable({
		data: users,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	});

	if (!isAdmin) {
		return <UnauthorizedPage />;
	}

	if (isLoading) {
		return <p>Loading...</p>;
	}

	return (
		<div className="w-full p-4">
			<div className="flex items-center py-4">
				<Input
					placeholder="Filter user names..."
					value={
						(table
							.getColumn("userName")
							?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table
							.getColumn("userName")
							?.setFilterValue(event.target.value)
					}
					className="max-w-sm"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Columns <ChevronDown />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef
															.header,
														header.getContext()
												  )}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-center space-x-2 py-4">
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AdminPanelPage;

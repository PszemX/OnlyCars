import Link from "next/link";

/* eslint-disable @next/next/no-img-element */
export default function UnauthorizedPage() {
	return (
		<div className="flex flex-col items-center justify-center bg-background px-4 my-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-md text-center">
				<LockIcon className="mx-auto h-12 w-12 text-primary" />
				<h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					Unauthorized Access
				</h1>
				<p className="mt-4 text-muted-foreground">
					You do not have the necessary permissions to access this
					resource. Please contact your administrator for assistance.
				</p>
				<div className="mt-6">
					<img
						src="https://t3.ftcdn.net/jpg/01/91/08/34/360_F_191083470_VtFAYAD2WjBIyvFk80Llr7sJ0hAFhCv3.jpg"
						alt="Unauthorized access illustration"
						className="mx-auto"
						width="300"
						height="300"
						style={{ aspectRatio: "300/300", objectFit: "cover" }}
					/>
				</div>
				<div className="mt-6">
					<Link
						href="/"
						className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
					>
						Go to Homepage
					</Link>
				</div>
			</div>
		</div>
	);
}

function LockIcon(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	);
}

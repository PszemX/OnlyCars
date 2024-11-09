// lib/utils.ts

/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function apiFetch(url: string, options = {}) {
	const token = Cookies.get("token");

	if (!token) {
		window.location.href = "/login";
		return;
	}

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${token}`,
		...(options as any).headers,
	};

	const response = await fetch(url, {
		...options,
		headers,
	});

	if (!response.ok) {
		if (response.status === 401) {
			// Unauthorized, redirect to login
			window.location.href = "/login";
		}
		const errorData = await response.json();
		throw new Error(errorData.message || "Network response was not ok");
	}

	return response.json();
}

export function isTokenExpired(token: string) {
	try {
		const decoded: any = jwtDecode(token);
		const currentTime = Date.now() / 1000; // in seconds
		return decoded.exp < currentTime;
	} catch (error) {
		console.error(error);
		return true;
	}
}

export function getToken() {
	const token = Cookies.get("token");
	if (token && !isTokenExpired(token)) {
		return token;
	}
	Cookies.remove("token");
	return null;
}

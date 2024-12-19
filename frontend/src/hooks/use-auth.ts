"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { isTokenExpired } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
	nameid: string;
}

export const useAuth = () => {
	const router = useRouter();
	const [userId, setUserId] = useState<string | null>(null);
	const [authenticated, setAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		const token = Cookies.get("token");
		if (!token || isTokenExpired(token)) {
			Cookies.remove("token");
			router.push("/login");
		} else {
			const decoded = jwtDecode<DecodedToken>(token);
			setUserId(decoded.nameid);
			setAuthenticated(true);
		}
	}, [router]);

	return { userId, authenticated };
};

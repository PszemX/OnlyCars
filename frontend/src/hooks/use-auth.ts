"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { isTokenExpired } from "@/lib/utils";

export const useAuth = () => {
	const router = useRouter();
	const [authenticated, setAuthenticated] = useState<boolean>(false);

	useEffect(() => {
		const token = Cookies.get("token");
		if (!token || isTokenExpired(token)) {
			Cookies.remove("token");
			router.push("/login");
		} else {
			setAuthenticated(true);
		}
	}, [router]);

	return authenticated;
};

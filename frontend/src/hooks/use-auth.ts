"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { isTokenExpired } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  nameid: string;
}

export const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = Cookies.get("token");
    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!token || isTokenExpired(token)) {
      Cookies.remove("token");
      setAuthenticated(false);
      setUserId(null);
      
      if (!isAuthPage) {
        router.push("/login");
      }
    } else {
      const decoded = jwtDecode<DecodedToken>(token);
      setUserId(decoded.nameid);
      setAuthenticated(true);

      if (isAuthPage) {
        router.push("/");
      }
    }
  }, [router, pathname]);

  return { userId, authenticated };
};
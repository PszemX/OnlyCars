"use client";

import { Navbar } from "@/components/navbar/Navbar";
import { FloatingMenu } from "@/components/menu/FloatingMenu";
import { FollowingMenu } from "@/components/menu/FollowingMenu";
import { FollowingProvider } from "@/context/FollowingContext";
import { LikeProvider } from "@/context/LikeContext";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";

export function LayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { authenticated } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  // If it's an auth page or not authenticated, render children without providers
  if (isAuthPage || !authenticated) {
    return (
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    );
  }

  // Only render providers when authenticated
  return (
    <html lang="en">
      <body>
        <FollowingProvider>
          <LikeProvider>
            <Navbar />
            {children}
            <FloatingMenu />
            <FollowingMenu />
          </LikeProvider>
        </FollowingProvider>
      </body>
    </html>
  );
}
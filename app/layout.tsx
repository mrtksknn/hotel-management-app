"use client";

import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  const showSidebar = pathname !== "/login" && pathname !== "/register";

  return (
    <html lang="tr">
      <body className="flex min-h-screen bg-gray-100">
        <Providers>
          {showSidebar && (
            <aside className="w-64 bg-white shadow-md p-6 flex flex-col">
              <h2 className="text-xl font-bold mb-6">My App</h2>
              <nav className="flex flex-col gap-3">
                <Link href="/dashboard" className="hover:bg-gray-200 p-2 rounded">
                  Dashboard
                </Link>
                <Link href="/profile" className="hover:bg-gray-200 p-2 rounded">
                  Profile
                </Link>
              </nav>
            </aside>
          )}
          <main className={`flex-1 p-6 ${showSidebar ? "" : "w-full"}`}>
            {children}
          </main>
        </Providers>

      </body>
    </html>
  );
}

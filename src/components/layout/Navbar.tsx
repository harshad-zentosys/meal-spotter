"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Meal Spotter
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href={
                isAuthenticated && user?.role === "mess-owner"
                  ? "/mess/dashboard"
                  : "/dashboard"
              }
              className={`text-sm ${
                pathname === "/dashboard" || pathname === "/mess/dashboard"
                  ? "font-bold"
                  : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            {isAuthenticated && user?.role === "mess-owner" && (
              <>
                <Link
                  href="/mess/profile"
                  className={`text-sm ${
                    pathname === "/mess/profile"
                      ? "font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  My Mess
                </Link>
                <Link
                  href="/mess/menu"
                  className={`text-sm ${
                    pathname === "/mess/menu"
                      ? "font-bold"
                      : "text-muted-foreground"
                  }`}
                >
                  Menu
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === "student" && (
              <Link
                href="/subscriptions"
                className={`text-sm ${
                  pathname === "/subscriptions"
                    ? "font-bold"
                    : "text-muted-foreground"
                }`}
              >
                My Subscriptions
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-sm text-muted-foreground"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-muted-foreground">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "student" | "mess-owner" | "admin";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't check during loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If role requirement exists, check if user meets it
    if (requiredRole && user?.role !== requiredRole) {
      // Redirect based on roles
      if (user?.role === "student") {
        router.push("/dashboard");
      } else if (user?.role === "mess-owner") {
        router.push("/mess/profile");
      } else if (user?.role === "admin") {
        router.push("/admin/users");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, requiredRole, router, user]);

  // Show loading or protected content
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated and has the required role, render the children
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole)) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

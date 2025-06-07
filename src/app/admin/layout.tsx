"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4 border-b pb-4">
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
          >
            Users
          </Link>
          <Link
            href="/admin/mess"
            className="px-4 py-2 rounded-md hover:bg-primary/10 transition-colors"
          >
            Mess Listings
          </Link>
        </div>

        {children}
      </div>
    </ProtectedRoute>
  );
}

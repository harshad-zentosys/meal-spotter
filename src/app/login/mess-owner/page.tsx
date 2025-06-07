"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft } from "lucide-react";

export default function MessOwnerLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect authenticated users
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === "student") {
        router.push("/dashboard");
      } else if (user.role === "mess-owner") {
        router.push("/mess/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/users");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);

      // Redirect mess owners to their profile page
      router.push("/mess/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render the login form if user is authenticated (they will be redirected)
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-primary mb-8 hover:underline"
      >
        <ChevronLeft size={16} />
        <span>Back to home</span>
      </Link>

      <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
        <div className="space-y-6">
          <div>
            <Badge className="mb-4 bg-orange-500 hover:bg-orange-600">
              For Mess Owners
            </Badge>
            <h1 className="text-3xl font-bold">Mess Owner Login</h1>
            <p className="mt-2 text-muted-foreground">
              Access your mess dashboard to manage menus, view subscriptions,
              and more.
            </p>
          </div>

          <div className="space-y-4 p-6 bg-primary/5 rounded-lg">
            <h3 className="font-semibold text-lg">
              Manage your mess with ease
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Update your daily menu</span>
              </li>
              <li className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Manage subscription plans</span>
              </li>
              <li className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>View and respond to reviews</span>
              </li>
              <li className="flex gap-2 items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                <span>Maintain your mess profile</span>
              </li>
            </ul>
          </div>
        </div>

        <Card className="border-muted/30 shadow-md">
          <CardHeader>
            <CardTitle>Sign In to Your Account</CardTitle>
            <CardDescription>
              Enter your credentials to access your mess dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account yet?{" "}
                <Link
                  href="/signup/mess-owner"
                  className="text-primary underline underline-offset-4"
                >
                  Sign up as mess owner
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Not a mess owner?{" "}
                <Link
                  href="/login"
                  className="text-primary underline underline-offset-4"
                >
                  Sign in as student
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

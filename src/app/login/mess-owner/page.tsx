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
import { ArrowRight, Calendar, ChefHat, ChevronLeft, Eye, EyeOff, Lock, Mail, Settings, Shield, Star, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

export default function MessOwnerLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const features = [
    {
      icon: Calendar,
      title: "Update your daily menu",
      description: "Keep your menu fresh and updated",
    },
    {
      icon: Users,
      title: "Manage subscription plans",
      description: "Handle student subscriptions efficiently",
    },
    {
      icon: Star,
      title: "View and respond to reviews",
      description: "Engage with student feedback",
    },
    {
      icon: Settings,
      title: "Maintain your mess profile",
      description: "Keep your information current",
    },
  ]

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
    // <div className="max-w-4xl mx-auto py-12 px-4">
    //   <Link
    //     href="/"
    //     className="flex items-center gap-2 text-primary mb-8 hover:underline"
    //   >
    //     <ChevronLeft size={16} />
    //     <span>Back to home</span>
    //   </Link>

    //   <div className="grid md:grid-cols-[1fr_1.5fr] gap-8">
    //     <div className="space-y-6">
    //       <div>
    //         <Badge className="mb-4 bg-orange-500 hover:bg-orange-600">
    //           For Mess Owners
    //         </Badge>
    //         <h1 className="text-3xl font-bold">Mess Owner Login</h1>
    //         <p className="mt-2 text-muted-foreground">
    //           Access your mess dashboard to manage menus, view subscriptions,
    //           and more.
    //         </p>
    //       </div>

    //       <div className="space-y-4 p-6 bg-primary/5 rounded-lg">
    //         <h3 className="font-semibold text-lg">
    //           Manage your mess with ease
    //         </h3>
    //         <ul className="space-y-3">
    //           <li className="flex gap-2 items-center">
    //             <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
    //             <span>Update your daily menu</span>
    //           </li>
    //           <li className="flex gap-2 items-center">
    //             <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
    //             <span>Manage subscription plans</span>
    //           </li>
    //           <li className="flex gap-2 items-center">
    //             <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
    //             <span>View and respond to reviews</span>
    //           </li>
    //           <li className="flex gap-2 items-center">
    //             <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
    //             <span>Maintain your mess profile</span>
    //           </li>
    //         </ul>
    //       </div>
    //     </div>

    //     <Card className="border-muted/30 shadow-md">
    //       <CardHeader>
    //         <CardTitle>Sign In to Your Account</CardTitle>
    //         <CardDescription>
    //           Enter your credentials to access your mess dashboard
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent>
    //         <form onSubmit={handleSubmit} className="space-y-4">
    //           <div className="space-y-2">
    //             <label className="text-sm font-medium" htmlFor="email">
    //               Email
    //             </label>
    //             <Input
    //               id="email"
    //               name="email"
    //               type="email"
    //               placeholder="you@example.com"
    //               value={formData.email}
    //               onChange={handleChange}
    //               required
    //             />
    //           </div>

    //           <div className="space-y-2">
    //             <div className="flex items-center justify-between">
    //               <label className="text-sm font-medium" htmlFor="password">
    //                 Password
    //               </label>
    //               <Link
    //                 href="/forgot-password"
    //                 className="text-xs text-primary"
    //               >
    //                 Forgot password?
    //               </Link>
    //             </div>
    //             <Input
    //               id="password"
    //               name="password"
    //               type="password"
    //               value={formData.password}
    //               onChange={handleChange}
    //               required
    //             />
    //           </div>

    //           {error && (
    //             <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">
    //               {error}
    //             </div>
    //           )}

    //           <Button type="submit" className="w-full" disabled={loading}>
    //             {loading ? "Signing in..." : "Sign In"}
    //           </Button>

    //           <div className="text-center text-sm">
    //             Don&apos;t have an account yet?{" "}
    //             <Link
    //               href="/signup/mess-owner"
    //               className="text-primary underline underline-offset-4"
    //             >
    //               Sign up as mess owner
    //             </Link>
    //           </div>

    //           <div className="text-center text-xs text-muted-foreground">
    //             Not a mess owner?{" "}
    //             <Link
    //               href="/login"
    //               className="text-primary underline underline-offset-4"
    //             >
    //               Sign in as student
    //             </Link>
    //           </div>
    //         </form>
    //       </CardContent>
    //     </Card>
    //   </div>
    // </div>


    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
    {/* Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-200/20 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-7xl mx-auto py-12 px-4">
      {/* Back to Home Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-8 font-medium transition-colors duration-200 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to home</span>
      </Link>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-start">
        {/* Left Side - Information */}
        <div className="space-y-8">
          <div className="space-y-6">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                For Mess Owners
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent leading-tight">
                Mess Owner
                <br />
                Dashboard
              </h1>
              <p className="mt-4 text-xl text-gray-600 leading-relaxed">
                Access your mess dashboard to manage menus, view subscriptions, and grow your business.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">50+</div>
                    <div className="text-sm text-gray-600">Partner Messes</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">4.8</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Manage your mess with ease</h3>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:sticky lg:top-8">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="">
                  {/* <ChefHat className="w-6 h-6 text-white" /> */}
                  <Image src="/logo.png" alt="Meal Spotter" width={80} height={80} />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Sign In to Your Account</CardTitle>
                  <CardDescription className="text-gray-600">
                    Enter your credentials to access your mess dashboard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="password">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Access Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500 font-medium">New to our platform?</span>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Don&apos;t have an account yet?</p>
                    <Link
                      href="/signup/mess-owner"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <ChefHat className="w-4 h-4" />
                      Register Your Mess
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Not a mess owner?</p>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200 group"
                    >
                      Sign in as student
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Secure Dashboard</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Free Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

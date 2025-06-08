"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Calendar, ChefHat, CreditCard, LayoutDashboard } from "lucide-react";
import { Bell, Store, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Settings, LogOut, X, Menu } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  console.log(user);
  const [isScrolled, setIsScrolled] = useState(false);    
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)  
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const isActive = (path: string) => pathname === path

  const studentNavItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/subscriptions",
      label: "My Subscriptions",
      icon: CreditCard,
    },
  ]

  const messOwnerNavItems = [
    {
      href: "/mess/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/mess/profile",
      label: "My Mess",
      icon: Store,
    },
    {
      href: "/mess/menu",
      label: "Menu",
      icon: Calendar,
    },
  ]

  const navItems = user?.role === "mess-owner" ? messOwnerNavItems : studentNavItems


  return (
    // <header className="w-full border-b">
    //   <div className="container mx-auto px-4 max-w-7xl flex h-16 items-center justify-between">
    //     <div className="flex items-center gap-6">
    //       <Link href="/" className="text-xl font-bold">
    //         Meal Spotter
    //       </Link>
    //       <nav className="hidden gap-6 md:flex">
    //         <Link
    //           href={
    //             isAuthenticated && user?.role === "mess-owner"
    //               ? "/mess/dashboard"
    //               : "/dashboard"
    //           }
    //           className={`text-sm ${
    //             pathname === "/dashboard" || pathname === "/mess/dashboard"
    //               ? "font-bold"
    //               : "text-muted-foreground"
    //           }`}
    //         >
    //           Dashboard
    //         </Link>
    //         {isAuthenticated && user?.role === "mess-owner" && (
    //           <>
    //             <Link
    //               href="/mess/profile"
    //               className={`text-sm ${
    //                 pathname === "/mess/profile"
    //                   ? "font-bold"
    //                   : "text-muted-foreground"
    //               }`}
    //             >
    //               My Mess
    //             </Link>
    //             <Link
    //               href="/mess/menu"
    //               className={`text-sm ${
    //                 pathname === "/mess/menu"
    //                   ? "font-bold"
    //                   : "text-muted-foreground"
    //               }`}
    //             >
    //               Menu
    //             </Link>
    //           </>
    //         )}
    //         {isAuthenticated && user?.role === "student" && (
    //           <Link
    //             href="/subscriptions"
    //             className={`text-sm ${
    //               pathname === "/subscriptions"
    //                 ? "font-bold"
    //                 : "text-muted-foreground"
    //             }`}
    //           >
    //             My Subscriptions
    //           </Link>
    //         )}
    //       </nav>
    //     </div>
    //     <div className="flex items-center gap-4">
    //       {isAuthenticated && user ? (
    //         <div className="flex items-center gap-4">
    //           <span className="text-sm">{user.name}</span>
    //           <Button
    //             variant="ghost"
    //             size="sm"
    //             onClick={handleLogout}
    //             className="text-sm text-muted-foreground"
    //           >
    //             Sign out
    //           </Button>
    //         </div>
    //       ) : (
    //         <div className="flex items-center gap-4">
    //           <Link href="/login" className="text-sm text-muted-foreground">
    //             Sign in
    //           </Link>
    //           <Link
    //             href="/signup"
    //             className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
    //           >
    //             Sign up
    //           </Link>
    //         </div>
    //       )}
    //     </div>
    //   </div>
    // </header>

    <header
    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50"
        : "bg-white/60 backdrop-blur-sm border-b border-gray-200/30"
    }`}
  >
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center  group">
            <Image src="/logo.png" alt="Meal Spotter" width={40} height={40} className="rounded-xl" />
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Meal'Spotter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={"/placeholder.svg"} alt={user.name || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                        {getInitials(user.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="flex items-center gap-2">
                        {/* <Badge
                          variant="secondary"
                          className={`text-xs ${
                            user.role === "mess-owner" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role === "mess-owner" ? "Mess Owner" : "Student"}
                        </Badge> */}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2 justify-between w-full align-middle">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            user.role === "mess-owner" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role === "mess-owner" ? "Mess Owner" : "Student"}
                        </Badge>
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator /> */}
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 ">
                    <LogOut className="w-4 h-4 mr-2 text-red-600" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Sign in
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && isAuthenticated && (
        <div className="lg:hidden border-t border-gray-200/50 bg-white/90 backdrop-blur-md">
          <div className="py-4 space-y-2">
            {isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}

            {!isAuthenticated && (
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Link
                  href="/login"
                  className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block px-4 py-3 text-sm font-medium bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </header>
  );
}

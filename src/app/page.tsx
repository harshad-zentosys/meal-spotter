import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
          Find the Perfect Mess
          <br />
          for Your Daily Meals
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
          Discover and compare mess options near your campus, view menus, and
          make informed decisions about your daily meals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="px-8">
            <Link href="/signup">Sign Up as Student</Link>
          </Button>
          <div className="space-y-2 sm:space-y-0">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full mb-2 sm:mb-0 sm:mr-2"
            >
              <Link href="/login">Student Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/login/mess-owner">Mess Owner Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mess Owner CTA Section */}
      <section className="bg-primary/5 rounded-xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 w-32 h-32 transform rotate-45 translate-x-16 -translate-y-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 relative">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">Own a Mess?</h2>
              <Badge className="bg-orange-500 hover:bg-orange-600">New</Badge>
            </div>
            <p className="text-lg">
              Join our platform to showcase your mess, manage your menu
              digitally, and attract more students.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Digital menu management</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Increased visibility to students</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Subscription management tools</span>
              </li>
            </ul>
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Link
                  href="/signup/mess-owner"
                  className="flex items-center gap-2"
                >
                  Register Your Mess
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                No invitation required - Sign up and start showcasing your mess
                today
              </p>
            </div>
          </div>
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
              alt="Mess Kitchen"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">
          Why Choose Meal Spotter?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Discover Nearby Messes
            </h3>
            <p className="text-muted-foreground">
              Easily find and compare messes near your campus with detailed
              information and reviews.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">View Daily Menus</h3>
            <p className="text-muted-foreground">
              Check what&apos;s cooking today in different messes and make
              informed decisions about your meals.
            </p>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Safe & Trusted</h3>
            <p className="text-muted-foreground">
              All messes on our platform are verified and regularly reviewed to
              ensure quality and hygiene.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

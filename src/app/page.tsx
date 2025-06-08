import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight,  Check, MapPin, Sparkles, Star, Users, Calendar, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-16 w-full">
      {/* Hero Section */}

      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Discover Your Perfect Meal</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent leading-tight">
              Find the Perfect
              <br />
              <span className="relative text-5xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent leading-tight">
                Mess
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-orange-300 to-red-300 rounded-full opacity-30" />
              </span>{" "}
              for Your Daily Meals
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover and compare mess options near your campus, view daily menus, and make informed decisions about
              your meals with our smart platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Button
                asChild
                size="lg"
                className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/signup" className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Sign Up as Student
                </Link>
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-6 py-6 text-lg border-2 hover:bg-orange-50 transition-all duration-300"
                >
                  <Link href="/login">Student Login</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="px-6 py-6 text-lg border-2 hover:bg-red-50 transition-all duration-300"
                >
                  <Link href="/login/mess-owner">Mess Owner Login</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 pt-12 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full border-2 border-white" />
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-pink-400 rounded-full border-2 border-white" />
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full border-2 border-white" />
                </div>
                <span>500+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>4.8/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mess Owner CTA Section */}
        {/* Mess Owner CTA Section */}
        <section className="px-20 relative">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-orange-50/50">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-400 to-red-500 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-400 to-pink-500 rounded-full blur-2xl opacity-20" />

            <CardContent className="p-8 lg:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Own a Mess?
                    </h2>
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-3 py-1 text-sm font-semibold shadow-lg">
                      New
                    </Badge>
                  </div>

                  <p className="text-xl text-gray-600 leading-relaxed">
                    Join our platform to showcase your mess, manage your menu digitally, and attract more students with
                    our powerful tools.
                  </p>

                  <div className="grid gap-4">
                    {[
                      "Digital menu management",
                      "Increased visibility to students",
                      "Subscription management tools",
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 space-y-4">
                    <Button
                      asChild
                      size="lg"
                      className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Link href="/signup/mess-owner" className="flex items-center gap-2">
                        Register Your Mess
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </Button>
                    <p className="text-sm text-gray-500">
                      No invitation required - Sign up and start showcasing your mess today
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <Image
                      src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                      alt="Mess Kitchen"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-xl opacity-30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

     
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Why Choose Meal Spotter?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of campus dining with our innovative platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Discover Nearby Messes",
                description:
                  "Easily find and compare messes near your campus with detailed information, photos, and authentic reviews from fellow students.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Calendar,
                title: "View Daily Menus",
                description:
                  "Check what's cooking today in different messes and make informed decisions about your meals with real-time menu updates.",
                gradient: "from-orange-500 to-red-500",
              },
              {
                icon: Shield,
                title: "Safe & Trusted",
                description:
                  "All messes on our platform are verified and regularly reviewed to ensure quality, hygiene, and authentic student experiences.",
                gradient: "from-green-500 to-emerald-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white transform hover:-translate-y-2"
              >
                <CardContent className="p-8 space-y-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "500+", label: "Active Students" },
              { number: "50+", label: "Partner Messes" },
              { number: "10K+", label: "Meals Served" },
              { number: "4.8", label: "Average Rating" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl lg:text-4xl font-bold">{stat.number}</div>
                <div className="text-orange-100 text-sm lg:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  UtensilsCrossed,
  Plus,
  Eye,
  Star,
  MessageSquare,
} from "lucide-react";

// Type definitions
interface MenuItem {
  name: string;
  description: string;
  type: "veg" | "non-veg";
  _id: string;
}

interface MenuForDate {
  date: string;
  items: MenuItem[];
  _id: string;
}

interface Plan {
  name: string;
  description: string;
  price: number;
  duration: number;
  _id: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Subscription {
  _id: string;
  userId: User;
  planName: string;
  planDescription: string;
  price: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  createdAt: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  revenue: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    userName: string;
    createdAt: string;
  }>;
}

interface MessProfile {
  _id: string;
  ownerId: string;
  name: string;
  type: "veg" | "non-veg" | "both";
  cuisine: string[];
  location: string;
  address: string;
  contactNumber: string;
  plans: Plan[];
  menu: MenuForDate[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function MessDashboardPage() {
  const [profile, setProfile] = useState<MessProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    revenue: 0,
  });
  const [reviewStats, setReviewStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileResponse, subscriptionsResponse] = await Promise.all([
          fetch("/api/mess/profile"),
          fetch("/api/mess/subscriptions"),
        ]);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfile(profileData.mess);

          // Fetch review data for this mess
          if (profileData.mess?._id) {
            try {
              const reviewResponse = await fetch(
                `/api/reviews/${profileData.mess._id}`
              );
              if (reviewResponse.ok) {
                const reviewData = await reviewResponse.json();
                setReviewStats({
                  averageRating: reviewData.averageRating,
                  totalReviews: reviewData.totalReviews,
                  recentReviews: reviewData.reviews.slice(0, 3), // Get top 3 recent reviews
                });
              }
            } catch (reviewError) {
              console.error("Error fetching review data:", reviewError);
            }
          }
        } else if (profileResponse.status === 404) {
          router.push("/mess/profile/setup");
          return;
        }

        if (subscriptionsResponse.ok) {
          const subscriptionsData = await subscriptionsResponse.json();
          setSubscriptions(subscriptionsData.subscriptions);
          setStats(subscriptionsData.stats);
        }

        setError("");
      } catch (err) {
        setError("Error fetching dashboard data. Please try again.");
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "mess-owner") {
      fetchData();
    }
  }, [user, router]);

  // Get today's menu
  const getTodaysMenu = () => {
    if (!profile?.menu) return null;

    const today = new Date();
    const todayString = today.toDateString();

    return profile.menu.find((menuItem) => {
      const menuDate = new Date(menuItem.date);
      return menuDate.toDateString() === todayString;
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate days remaining for subscription
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const todaysMenu = getTodaysMenu();

  return (
    <ProtectedRoute requiredRole="mess-owner">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {profile?.name ? `${profile.name} Dashboard` : "Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening with your mess
              today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/mess/profile")}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button onClick={() => router.push("/mess/profile")}>
              <Plus className="h-4 w-4 mr-2" />
              Manage Mess
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Mess Info Card */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Mess Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Type
                  </p>
                  <p className="text-lg font-semibold capitalize">
                    {profile.type}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="text-lg font-semibold">{profile.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact
                  </p>
                  <p className="text-lg font-semibold">
                    {profile.contactNumber || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Plans
                  </p>
                  <p className="text-lg font-semibold">
                    {profile.plans?.length || 0}
                  </p>
                </div>
              </div>
              {profile.plans && profile.plans.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Available Plans:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.plans.map((plan) => (
                      <Badge key={plan._id} variant="outline">
                        {plan.name} - ₹{plan.price} ({plan.duration} days)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscriptions
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.revenue}</div>
              <p className="text-xs text-muted-foreground">
                From active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0
                  ? `${((stats.active / stats.total) * 100).toFixed(
                      1
                    )}% of total`
                  : "No subscriptions yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center">
                  {renderStars(Math.round(reviewStats.averageRating))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {reviewStats.totalReviews} review
                {reviewStats.totalReviews !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews */}
        {reviewStats.recentReviews.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Reviews
                </CardTitle>
                <CardDescription>
                  Latest feedback from your customers
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/mess/${profile?._id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Reviews
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewStats.recentReviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {review.userName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Menu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today&apos;s Menu
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/mess/profile")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Update Menu
            </Button>
          </CardHeader>
          <CardContent>
            {todaysMenu ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todaysMenu.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 border rounded-lg"
                  >
                    <span
                      className={`h-3 w-3 mt-1 rounded-full flex-shrink-0 ${
                        item.type === "veg" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UtensilsCrossed className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">
                  No menu set for today. Add today&apos;s menu to inform your
                  subscribers.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/mess/profile")}
                >
                  Add Today&apos;s Menu
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>User Subscriptions</CardTitle>
            <CardDescription>
              Manage and view your current subscriber base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">
                  Active ({stats.active})
                </TabsTrigger>
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4">
                {subscriptions.filter((sub) => sub.status === "active").length >
                0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions
                        .filter((sub) => sub.status === "active")
                        .map((subscription) => (
                          <TableRow key={subscription._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {subscription.userId.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {subscription.userId.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {subscription.planName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {subscription.planDescription}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{subscription.duration} days</TableCell>
                            <TableCell>₹{subscription.price}</TableCell>
                            <TableCell>
                              <div>
                                <p>{formatDate(subscription.endDate)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {getDaysRemaining(subscription.endDate) > 0
                                    ? `${getDaysRemaining(
                                        subscription.endDate
                                      )} days left`
                                    : "Expired"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  subscription.status === "active"
                                    ? "default"
                                    : subscription.status === "expired"
                                    ? "secondary"
                                    : "destructive"
                                }
                              >
                                {subscription.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No active subscriptions yet. Start promoting your mess to
                      attract students!
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="mt-4">
                {subscriptions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((subscription) => (
                        <TableRow key={subscription._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {subscription.userId.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {subscription.userId.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {subscription.planName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {subscription.planDescription}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{subscription.duration} days</TableCell>
                          <TableCell>₹{subscription.price}</TableCell>
                          <TableCell>
                            {formatDate(subscription.startDate)}
                          </TableCell>
                          <TableCell>
                            {formatDate(subscription.endDate)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                subscription.status === "active"
                                  ? "default"
                                  : subscription.status === "expired"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {subscription.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No subscriptions yet. Share your mess details with
                      students to get started!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

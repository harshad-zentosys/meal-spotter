"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  MapPin,
  Phone,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  ExternalLink,
} from "lucide-react";

// Default placeholder image
const defaultMessImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80";

// TypeScript interfaces
interface Mess {
  _id: string;
  name: string;
  type: "veg" | "non-veg" | "both";
  cuisine: string[];
  lat: number;
  lng: number;
  address: string;
  contactNumber: string;
  image?: string;
}

interface Subscription {
  _id: string;
  messId: Mess;
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
  expired: number;
  totalSpent: number;
}

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    expired: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch("/api/user/subscriptions");
        const data = await response.json();

        if (response.ok) {
          setSubscriptions(data.subscriptions);
          setStats(data.stats);
          setError("");
        } else {
          setError(data.error || "Failed to fetch subscriptions");
        }
      } catch (err) {
        setError("Error fetching subscriptions. Please try again.");
        console.error("Subscriptions fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role !== "mess-owner") {
      fetchSubscriptions();
    }
  }, [user]);

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

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "expired":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="student">
      <div className="space-y-8 px-20 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage and track your mess subscriptions
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Browse Messes
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className=" bg-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscriptions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All time subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className=" bg-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className=" bg-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Expired Subscriptions
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">
                Past subscriptions
              </p>
            </CardContent>
          </Card>

          <Card className=" bg-yellow-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalSpent}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions Content */}
        {subscriptions.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Subscriptions</CardTitle>
              <CardDescription>
                View and manage all your mess subscriptions
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
                  {subscriptions.filter((sub) => sub.status === "active")
                    .length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {subscriptions
                        .filter((sub) => sub.status === "active")
                        .map((subscription) => (
                          <Card
                            key={subscription._id}
                            className="border-l-4 border-l-green-500"
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                    <Image
                                      src={
                                        subscription.messId.image ||
                                        defaultMessImage
                                      }
                                      alt={subscription.messId.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="text-lg font-semibold">
                                        {subscription.messId.name}
                                      </h3>
                                      <Badge variant="outline">
                                        {subscription.messId.type}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <a href={`https://maps.google.com/?q=${subscription.messId.lat},${subscription.messId.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                          <MapPin className="h-3 w-3" />
                                          {subscription.messId.address}
                                        </a>
                                      </div>
                                      {subscription.messId.contactNumber && (
                                        <div className="flex items-center gap-1">
                                          <Phone className="h-3 w-3" />
                                          {subscription.messId.contactNumber}
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Expires:{" "}
                                        {formatDate(subscription.endDate)}
                                        {getDaysRemaining(
                                          subscription.endDate
                                        ) > 0 && (
                                          <span className="text-green-600 font-medium">
                                            (
                                            {getDaysRemaining(
                                              subscription.endDate
                                            )}{" "}
                                            days left)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="mb-2">
                                    <Badge
                                      variant={getStatusBadgeVariant(
                                        subscription.status
                                      )}
                                    >
                                      {subscription.status}
                                    </Badge>
                                  </div>
                                  <div className="text-lg font-bold">
                                    ₹{subscription.price}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {subscription.planName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {subscription.duration} days
                                  </div>
                                  <Link
                                    href={`/mess/${subscription.messId._id}`}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View Mess
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Active Subscriptions
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You don&apos;t have any active mess subscriptions at the
                        moment.
                      </p>
                      <Link href="/dashboard">
                        <Button>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Browse Messes
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="all" className="mt-4">
                  {subscriptions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mess</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptions.map((subscription) => (
                          <TableRow key={subscription._id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted">
                                  <Image
                                    src={
                                      subscription.messId.image ||
                                      defaultMessImage
                                    }
                                    alt={subscription.messId.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {subscription.messId.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {subscription.messId.address}
                                  </p>
                                </div>
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
                              <div>
                                <p>{formatDate(subscription.endDate)}</p>
                                {subscription.status === "active" && (
                                  <p className="text-sm text-muted-foreground">
                                    {getDaysRemaining(subscription.endDate) > 0
                                      ? `${getDaysRemaining(
                                          subscription.endDate
                                        )} days left`
                                      : "Expired"}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getStatusBadgeVariant(
                                  subscription.status
                                )}
                              >
                                {subscription.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/mess/${subscription.messId._id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No Subscriptions Yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        You haven&apos;t subscribed to any mess yet.
                      </p>
                      <Link href="/dashboard">
                        <Button>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Browse Messes
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Subscriptions Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t subscribed to any mess yet. Start exploring
                messes in your area and find the perfect meal plan for you.
              </p>
              <Link href="/dashboard">
                <Button size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse Messes
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}

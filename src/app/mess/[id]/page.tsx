"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import ReviewSection from "@/components/ui/ReviewSection";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import loadScript from "@/lib/common/razorypayScript";

// Default placeholder image
const defaultImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80";
const defaultFoodImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80";

// TypeScript interfaces
interface MenuItem {
  name: string;
  type: "veg" | "non-veg";
  image?: string;
  description?: string;
  price?: number;
}

interface MenuForDate {
  date: string;
  items: MenuItem[];
}

interface SubscriptionPlan {
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface UserSubscription {
  _id: string;
  messId: {
    _id: string;
    name: string;
    type: string;
    location: string;
    address: string;
    contactNumber?: string;
    image?: string;
  };
  planName: string;
  planDescription: string;
  price: number;
  duration: number;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
}

interface Mess {
  id: string;
  name: string;
  type: "veg" | "non-veg" | "both";
  location: string;
  address: string;
  contactNumber: string;
  description: string;
  cuisine: string[];
  image: string;
  plans: SubscriptionPlan[];
  menu: MenuForDate[];
}

export default function MessDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [mess, setMess] = useState<Mess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribingToPlans, setSubscribingToPlans] = useState<Set<number>>(
    new Set()
  );
  const [unsubscribingFromPlans, setUnsubscribingFromPlans] = useState<
    Set<number>
  >(new Set());
  const [userSubscriptions, setUserSubscriptions] = useState<
    UserSubscription[]
  >([]);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        const response = await fetch(`/api/messes/${id}`);
        const data = await response.json();

        if (response.ok) {
          setMess(data.mess);
        } else {
          setError(data.error || "Failed to load mess details");
        }
      } catch (err) {
        setError("Error fetching mess details. Please try again later.");
        console.error("Error fetching mess details:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserSubscriptions = async () => {
      if (!user || user.role === "mess-owner") return;

      try {
        const response = await fetch("/api/user/subscriptions");
        const data = await response.json();

        if (response.ok) {
          setUserSubscriptions(data.subscriptions);
        } else {
          console.error("Error fetching subscriptions:", data.error);
        }
      } catch (error) {
        console.error("Error fetching user subscriptions:", error);
      }
    };

    const checkReviewEligibility = async () => {
      if (!user || !id) return;

      try {
        const response = await fetch(`/api/reviews/can-review/${id}`);
        const data = await response.json();
        setCanReview(data.canReview);
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      }
    };

    if (id) {
      fetchMessDetails();
      fetchUserSubscriptions();
      checkReviewEligibility();
    }
  }, [id, user]);

  // Check if user is subscribed to a specific plan
  const isSubscribedToPlan = (
    plan: SubscriptionPlan
  ): UserSubscription | null => {
    if (!user || !userSubscriptions.length) return null;

    return (
      userSubscriptions.find(
        (sub) =>
          sub.messId._id === mess?.id &&
          sub.planName === plan.name &&
          sub.status === "active"
      ) || null
    );
  };

  // Check if user has any active subscription to the current mess
  const hasActiveSubscriptionToMess = (): boolean => {
    if (!user || !userSubscriptions.length) return false;

    return userSubscriptions.some(
      (sub) => sub.messId._id === mess?.id && sub.status === "active"
    );
  };

  const handleSubscribe = async (plan: SubscriptionPlan, planIndex: number) => {
    if (!user) {
      toast.error("Please log in to subscribe");
      router.push("/login");
      return;
    }

    if (user.role === "mess-owner") {
      toast.error("Mess owners cannot subscribe to plans");
      return;
    }

    setSubscribingToPlans((prev) => new Set(prev).add(planIndex));

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messId: mess?.id,
          planName: plan.name,
          planDescription: plan.description,
          price: plan.price,
          duration: plan.duration,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        console.log("Razorpay script loaded");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: plan.price * 100,
          currency: "INR",
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            console.log(response);
            const subResponse = await fetch("/api/subscriptions/create", {
              method: "POST",
              body: JSON.stringify({
                subscriptionId: data.subscription._id,
                messId: mess?.id,
              }),
            });
            const subData = await subResponse.json();
            console.log("subData", subData);
            if (subResponse.ok) {
              toast.success("Successfully subscribed to the plan!");
              const subResponse = await fetch("/api/user/subscriptions");
              const subData = await subResponse.json();
              if (subResponse.ok) {
                setUserSubscriptions(subData.subscriptions);
              }
            } else {
              toast.error(subData.error || "Failed to subscribe to the plan");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
          },
        };

        console.log(options);

        const paymentObject = new (window as any).Razorpay(options);

        paymentObject.open();

        paymentObject.on("payment.failed", async function (response: any) {
          console.log(response);
          toast.error("Payment failed");
        });

        paymentObject.on("payment.success", function (response: any) {
          console.log(response);
          toast.success("Payment successful");
        });

        // toast.success(data.message || "Successfully subscribed to the plan!");
        // // Refresh user subscriptions
        // const subResponse = await fetch("/api/user/subscriptions");
        // const subData = await subResponse.json();
        // if (subResponse.ok) {
        //   setUserSubscriptions(subData.subscriptions);
        // }
      } else {
        toast.error(data.error || "Failed to subscribe to the plan");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Error subscribing to the plan. Please try again.");
    } finally {
      setSubscribingToPlans((prev) => {
        const newSet = new Set(prev);
        newSet.delete(planIndex);
        return newSet;
      });
    }
  };

  const handleUnsubscribe = async (
    plan: SubscriptionPlan,
    planIndex: number
  ) => {
    if (!user) {
      toast.error("Please log in to unsubscribe");
      return;
    }

    const subscription = isSubscribedToPlan(plan);
    if (!subscription) {
      toast.error("Subscription not found");
      return;
    }

    setUnsubscribingFromPlans((prev) => new Set(prev).add(planIndex));

    try {
      const response = await fetch(`/api/subscriptions/${subscription._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          data.message || "Successfully unsubscribed from the plan!"
        );
        // Refresh user subscriptions
        const subResponse = await fetch("/api/user/subscriptions");
        const subData = await subResponse.json();
        if (subResponse.ok) {
          setUserSubscriptions(subData.subscriptions);
        }
      } else {
        toast.error(data.error || "Failed to unsubscribe from the plan");
      }
    } catch (err) {
      console.error("Unsubscribe error:", err);
      toast.error("Error unsubscribing from the plan. Please try again.");
    } finally {
      setUnsubscribingFromPlans((prev) => {
        const newSet = new Set(prev);
        newSet.delete(planIndex);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !mess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6">
              <Image
                src={mess.image || defaultImage}
                alt={mess.name}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{mess.name}</h1>
                <Badge
                  variant={
                    mess.type === "veg"
                      ? "default"
                      : mess.type === "non-veg"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {mess.type === "veg"
                    ? "Vegetarian"
                    : mess.type === "non-veg"
                    ? "Non-Vegetarian"
                    : "Veg & Non-Veg"}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {mess.cuisine.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex items-start gap-2 mt-4 text-muted-foreground">
                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{mess.location}</p>
                  <p>{mess.address}</p>
                </div>
              </div>

              {mess.contactNumber && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <p>{mess.contactNumber}</p>
                </div>
              )}

              {mess.description && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">About</h2>
                  <p className="text-muted-foreground">{mess.description}</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <Tabs defaultValue="menu">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="menu">Menu</TabsTrigger>
                  <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="menu" className="mt-6">
                  {mess.menu && mess.menu.length > 0 ? (
                    <div className="space-y-6">
                      {mess.menu.map((menuItem, menuIndex) => (
                        <Card key={menuIndex}>
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              {new Date(menuItem.date).toLocaleDateString()}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {menuItem.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex flex-col rounded-md border p-2"
                                >
                                  <div className="relative w-full h-24 mb-2 overflow-hidden rounded-md">
                                    <Image
                                      src={item.image || defaultFoodImage}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span
                                      className={`h-2 w-2 rounded-full ${
                                        item.type === "veg"
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}
                                    />
                                    {item.name}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                  {item.price !== undefined && (
                                    <p className="text-sm font-semibold text-emerald-600 mt-1">
                                      ₹{item.price}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <h3 className="text-xl font-medium mb-2">
                        No Menu Available
                      </h3>
                      <p className="text-muted-foreground">
                        This mess hasn&apos;t uploaded their menu yet
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="plans" className="mt-6">
                  {mess.plans && mess.plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mess.plans.map((plan, planIndex) => {
                        const subscription = isSubscribedToPlan(plan);
                        const isSubscribed = !!subscription;
                        const isSubscribing = subscribingToPlans.has(planIndex);
                        const isUnsubscribing =
                          unsubscribingFromPlans.has(planIndex);
                        const hasActiveSubscription =
                          hasActiveSubscriptionToMess();

                        return (
                          <Card key={planIndex}>
                            <CardHeader>
                              <CardTitle>{plan.name}</CardTitle>
                              <CardDescription>
                                {plan.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-3xl font-bold">
                                    ₹{plan.price}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {plan.duration} days
                                  </p>
                                </div>
                                {isSubscribed ? (
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleUnsubscribe(plan, planIndex)
                                    }
                                    disabled={isUnsubscribing}
                                  >
                                    {isUnsubscribing ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Unsubscribing...
                                      </>
                                    ) : (
                                      "Unsubscribe"
                                    )}
                                  </Button>
                                ) : (
                                  <div className="text-right">
                                    <Button
                                      onClick={() =>
                                        handleSubscribe(plan, planIndex)
                                      }
                                      disabled={
                                        isSubscribing ||
                                        (hasActiveSubscription && !isSubscribed)
                                      }
                                    >
                                      {isSubscribing ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Subscribing...
                                        </>
                                      ) : (
                                        "Subscribe"
                                      )}
                                    </Button>
                                    {hasActiveSubscription && !isSubscribed && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Already subscribed to another plan
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                      <h3 className="text-xl font-medium mb-2">
                        No Plans Available
                      </h3>
                      <p className="text-muted-foreground">
                        This mess hasn&apos;t created any subscription plans yet
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <ReviewSection messId={mess.id} canReview={canReview} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscribe</CardTitle>
                <CardDescription>
                  Choose a mess plan that suits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mess.plans && mess.plans.length > 0 ? (
                    mess.plans.map((plan, planIndex) => {
                      const subscription = isSubscribedToPlan(plan);
                      const isSubscribed = !!subscription;
                      const isSubscribing = subscribingToPlans.has(planIndex);
                      const isUnsubscribing =
                        unsubscribingFromPlans.has(planIndex);
                      const hasActiveSubscription =
                        hasActiveSubscriptionToMess();

                      return (
                        <div
                          key={planIndex}
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ₹{plan.price} for {plan.duration} days
                            </p>
                            {hasActiveSubscription && !isSubscribed && (
                              <p className="text-xs text-muted-foreground">
                                Already subscribed to another plan
                              </p>
                            )}
                          </div>
                          {isSubscribed ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUnsubscribe(plan, planIndex)}
                              disabled={isUnsubscribing}
                            >
                              {isUnsubscribing ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Unsubscribing...
                                </>
                              ) : (
                                "Unsubscribe"
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleSubscribe(plan, planIndex)}
                              disabled={
                                isSubscribing ||
                                (hasActiveSubscription && !isSubscribed)
                              }
                            >
                              {isSubscribing ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Subscribing...
                                </>
                              ) : (
                                "Select"
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No subscription plans available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mess.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{mess.contactNumber}</p>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p>{mess.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {mess.address}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

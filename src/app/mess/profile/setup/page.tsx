"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MessProfileSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    type: "both",
    cuisine: "",
    location: "",
    address: "",
    contactNumber: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  useEffect(() => {
    // Fetch the initial mess profile data
    const fetchMessProfile = async () => {
      try {
        const response = await fetch("/api/mess/profile");
        const data = await response.json();

        if (response.ok && data.mess) {
          // Populate form with existing data
          setProfileData({
            name: data.mess.name || "",
            type: data.mess.type || "both",
            cuisine: data.mess.cuisine ? data.mess.cuisine.join(", ") : "",
            location: data.mess.location || "",
            address: data.mess.address || "",
            contactNumber: data.mess.contactNumber || "",
            description: data.mess.description || "",
          });
        }
      } catch (error) {
        console.error("Error fetching mess profile:", error);
      }
    };

    fetchMessProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (currentStep === totalSteps) {
      try {
        const response = await fetch("/api/mess/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...profileData,
            cuisine: profileData.cuisine
              ? profileData.cuisine.split(",").map((item) => item.trim())
              : [],
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update profile");
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/mess/profile");
        }, 2000);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    } else {
      // Move to next step if not on the final step
      setCurrentStep((prev) => prev + 1);
      setLoading(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <ProtectedRoute requiredRole="mess-owner">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Setup Your Mess Profile</h1>
          <p className="text-muted-foreground mt-2">
            Complete your profile to start attracting students to your mess
          </p>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-16 rounded-full ${
                    index + 1 <= currentStep ? "bg-primary" : "bg-primary/20"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">
              Profile updated successfully! Redirecting...
            </p>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Tell us about your mess</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Mess Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Food Type</Label>
                    <select
                      id="type"
                      name="type"
                      value={profileData.type}
                      onChange={handleChange}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="veg">Vegetarian Only</option>
                      <option value="non-veg">Non-vegetarian Only</option>
                      <option value="both">Both Veg and Non-veg</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuisine">
                      Cuisine Types (comma separated)
                    </Label>
                    <Input
                      id="cuisine"
                      name="cuisine"
                      value={profileData.cuisine}
                      onChange={handleChange}
                      placeholder="North Indian, South Indian, Chinese"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">About Your Mess</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={profileData.description}
                      onChange={handleChange}
                      placeholder="Describe your mess, specialties, and what makes it unique"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    How students can find and reach you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location/Area</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      placeholder="e.g., North Campus"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Complete Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      placeholder="Provide the complete address of your mess"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={profileData.contactNumber}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      required
                    />
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBack}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              {currentStep === 1 && <div></div>}
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Processing..."
                  : currentStep === totalSteps
                  ? "Complete Setup"
                  : "Continue"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

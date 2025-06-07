"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Mail,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export default function MessOwnerSignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP, 3: Account Details
  const [otpTimer, setOtpTimer] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    password: "",
    confirmPassword: "",
    image: null as File | null,
  });

  const { user, isLoading, isAuthenticated } = useAuth();

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

  // OTP timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setError("");
    }
  };

  const sendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: "mess-owner-signup",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // mask the mail
      const maskedEmail = formData.email.replace(
        /^.*@/,
        "*****@"
      );
      setCurrentStep(2);
      setOtpTimer(600); // 10 minutes
      setSuccess(`OTP sent to ${maskedEmail}. Please check your email.`);

      // Show the OTP if it's returned in the response
      if (data.otp) {
        setSuccess(
          `OTP sent to ${maskedEmail}. Please check your email.`
        );
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.otp) {
      setError("Please enter the OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          purpose: "mess-owner-signup",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      setCurrentStep(3);
      setSuccess("Email verified successfully! Now create your account.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.name || !formData.password || !formData.confirmPassword) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("otp", formData.otp);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      const response = await fetch("/api/auth/signup/mess-owner", {
        method: "POST",
        body: submitData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setSuccess(
        "Account created successfully! Redirecting to profile setup..."
      );

      setTimeout(() => {
        router.push("/mess/profile/setup");
      }, 2000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (otpTimer > 0) return;

    await sendOTP({ preventDefault: () => {} } as React.FormEvent);
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setError("");
      setSuccess("");
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

  // Don't render the signup form if user is authenticated (they will be redirected)
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
            <h1 className="text-3xl font-bold">
              Join Meal Spotter as a Mess Owner
            </h1>
            <p className="mt-2 text-muted-foreground">
              Take your mess business to the next level with digital menu
              management and increased visibility to students.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Mail className="h-4 w-4" />
              </div>
              <span
                className={
                  currentStep >= 1
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }
              >
                Email Verification
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Shield className="h-4 w-4" />
              </div>
              <span
                className={
                  currentStep >= 2
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }
              >
                OTP Verification
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 3
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span
                className={
                  currentStep >= 3
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }
              >
                Account Creation
              </span>
            </div>
          </div>

          <div className="space-y-4 p-6 bg-primary/5 rounded-lg">
            <h3 className="font-semibold text-lg">Why join as a Mess Owner?</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Digital menu management - Update your menu easily</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Increased visibility to nearby students</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Receive feedback and improve your services</span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Attract more customers through the platform</span>
              </li>
            </ul>
          </div>
        </div>

        <Card className="border-muted/30 shadow-md">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Verify Your Email"}
              {currentStep === 2 && "Enter OTP"}
              {currentStep === 3 && "Create Your Account"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 &&
                "We'll send a verification code to your email"}
              {currentStep === 2 && "Enter the 6-digit code sent to your email"}
              {currentStep === 3 && "Complete your account setup"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {currentStep === 1 && (
              <form onSubmit={sendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            {/* Step 2: OTP */}
            {currentStep === 2 && (
              <form onSubmit={verifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code *</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Code sent to: {formData.email}
                  </p>
                  {otpTimer > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Resend code in {Math.floor(otpTimer / 60)}:
                      {String(otpTimer % 60).padStart(2, "0")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resendOTP}
                    disabled={otpTimer > 0 || loading}
                  >
                    Resend
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  className="w-full"
                >
                  Back to Email
                </Button>
              </form>
            )}

            {/* Step 3: Account Details */}
            {currentStep === 3 && (
              <form onSubmit={register} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Mess Logo/Image (Optional)</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a logo or image for your mess (max 5MB, JPG/PNG)
                  </p>
                  {formData.image && (
                    <p className="text-xs text-green-600">
                      Selected: {formData.image.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  className="w-full"
                >
                  Back to OTP
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

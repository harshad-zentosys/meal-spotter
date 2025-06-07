"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash,
  UtensilsCrossed,
  Calendar,
} from "lucide-react";

// Plan type definition
interface Plan {
  name: string;
  description: string;
  price: number;
  duration: number;
}

// Menu item type definition
interface MenuItem {
  name: string;
  description: string;
  type: "veg" | "non-veg";
  image?: string;
}

// Menu for date type definition
interface MenuForDate {
  date: Date;
  items: MenuItem[];
}

// Profile type definition
interface MessProfile {
  id: string;
  name: string;
  type: string;
  cuisine: string[];
  location: string;
  address: string;
  contactNumber: string;
  description: string;
  image?: string;
  plans: Plan[];
  menu: MenuForDate[];
  [key: string]: unknown;
}

export default function MessProfilePage() {
  const [profile, setProfile] = useState<MessProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<MessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Plan management state
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan>({
    name: "",
    description: "",
    price: 0,
    duration: 30,
  });
  const [planError, setPlanError] = useState("");

  // Menu management state
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [menuDate, setMenuDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: "", description: "", type: "veg" },
  ]);
  const [menuError, setMenuError] = useState("");

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchMessProfile = async () => {
      try {
        const response = await fetch("/api/mess/profile");
        const data = await response.json();

        if (response.ok && data.mess) {
          setProfile(data.mess);
          setEditedProfile(data.mess);
          setError("");
        } else if (response.status === 404) {
          // Redirect to profile setup if mess not found
          router.push("/mess/profile/setup");
        } else {
          setError(data.error || "Failed to load profile");
        }
      } catch {
        setError("Error fetching profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "mess-owner") {
      fetchMessProfile();
    }
  }, [user, router]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Discard changes
      setEditedProfile(profile);
    }
    setIsEditing(!isEditing);
    setError("");
    setSuccess(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedProfile((prev: MessProfile | null) =>
      prev ? { ...prev, [name]: value } : null
    );
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
      setSelectedImage(file);
      setError("");
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    // Basic validation
    if (
      !editedProfile?.name ||
      !editedProfile.location ||
      !editedProfile.address
    ) {
      setError("Name, location, and address are required");
      return;
    }

    setLoadingAction(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", editedProfile.name);
      formData.append("type", editedProfile.type);
      formData.append("cuisine", JSON.stringify(editedProfile.cuisine));
      formData.append("location", editedProfile.location);
      formData.append("address", editedProfile.address);
      formData.append("contactNumber", editedProfile.contactNumber || "");
      formData.append("description", editedProfile.description || "");
      formData.append("plans", JSON.stringify(editedProfile.plans || []));

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      // Make API call to update the profile
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        body: formData, // Don't set Content-Type header for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data.mess);
      setIsEditing(false);
      setSuccess(true);
      setSelectedImage(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        (err as Error).message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  // Plan management functions
  const handlePlanChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Convert price and duration to numbers
    const processedValue =
      name === "price" || name === "duration" ? Number(value) : value;
    setCurrentPlan((prev: Plan) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleAddPlan = () => {
    setPlanError("");

    // Validation
    if (!currentPlan.name) {
      setPlanError("Plan name is required");
      return;
    }

    if (currentPlan.price <= 0) {
      setPlanError("Price must be greater than 0");
      return;
    }

    if (currentPlan.duration <= 0) {
      setPlanError("Duration must be greater than 0");
      return;
    }

    // Calculate the updated plans array with the new plan
    const updatedPlans = [...(editedProfile?.plans || []), currentPlan];

    // Add the new plan to the edited profile
    setEditedProfile((prev: MessProfile | null) =>
      prev
        ? {
            ...prev,
            plans: updatedPlans,
          }
        : null
    );

    // Reset the form
    setCurrentPlan({
      name: "",
      description: "",
      price: 0,
      duration: 30,
    });

    // Close the modal
    setShowPlanModal(false);

    // Update the profile with the calculated updated plans array
    handleSavePlans(updatedPlans);
  };

  const handleDeletePlan = (index: number) => {
    const updatedPlans = [...(editedProfile?.plans || [])];
    updatedPlans.splice(index, 1);

    setEditedProfile((prev: MessProfile | null) =>
      prev
        ? {
            ...prev,
            plans: updatedPlans,
          }
        : null
    );

    // Update the profile
    handleSavePlans(updatedPlans);
  };

  const handleSavePlans = async (plans: Plan[]) => {
    setLoadingAction(true);

    try {
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editedProfile,
          plans: plans,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update plans");
      }

      setProfile(data.mess);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to update plans. Please try again."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  // Menu management functions
  const handleAddMenuItem = () => {
    setMenuItems([...menuItems, { name: "", description: "", type: "veg" }]);
  };

  const handleRemoveMenuItem = (index: number) => {
    const newItems = [...menuItems];
    newItems.splice(index, 1);
    setMenuItems(newItems);
  };

  const handleMenuItemChange = (
    index: number,
    field: keyof MenuItem,
    value: string
  ) => {
    const newItems = [...menuItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setMenuItems(newItems);
  };

  const handleSaveMenu = async () => {
    setMenuError("");

    // Validation
    if (!menuDate) {
      setMenuError("Date is required");
      return;
    }

    // Validate each menu item
    const validItems = menuItems.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) {
      setMenuError("At least one valid menu item is required");
      return;
    }

    setLoadingAction(true);

    try {
      // Prepare the menu data
      const menuData = {
        date: new Date(menuDate),
        items: validItems,
      };

      // Get existing menu or create empty array
      const existingMenu = editedProfile?.menu || [];

      // Find if there's already a menu for this date
      const dateIndex = existingMenu.findIndex(
        (m: MenuForDate) =>
          new Date(m.date).toISOString().split("T")[0] === menuDate
      );

      let updatedMenu;
      if (dateIndex >= 0) {
        // Update existing date's menu
        updatedMenu = [...existingMenu];
        updatedMenu[dateIndex] = menuData;
      } else {
        // Add new date's menu
        updatedMenu = [...existingMenu, menuData];
      }

      // Sort menu by date (newest first)
      updatedMenu.sort((a: MenuForDate, b: MenuForDate) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Update the profile
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editedProfile,
          menu: updatedMenu,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update menu");
      }

      // Update state
      setProfile(data.mess);
      setEditedProfile(data.mess);
      setSuccess(true);

      // Reset form and close modal
      setMenuItems([{ name: "", description: "", type: "veg" }]);
      setShowMenuModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setMenuError(
        (err as Error).message || "Failed to update menu. Please try again."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteMenu = async (dateIndex: number) => {
    setLoadingAction(true);

    try {
      const updatedMenu = [...(editedProfile?.menu || [])];
      updatedMenu.splice(dateIndex, 1);

      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editedProfile,
          menu: updatedMenu,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete menu");
      }

      // Update state
      setProfile(data.mess);
      setEditedProfile(data.mess);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to delete menu. Please try again."
      );
    } finally {
      setLoadingAction(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="mess-owner">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mess Profile</h1>
            <p className="text-muted-foreground">
              View and manage your mess profile
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={handleEditToggle}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave} disabled={loadingAction}>
                {loadingAction ? "Saving..." : "Save Changes"}
              </Button>
            )}
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
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">
              Profile updated successfully!
            </p>
          </div>
        )}

        {profile && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Details about your mess that will be visible to students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mess Name</label>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={editedProfile?.name || ""}
                        onChange={handleChange}
                        placeholder="e.g., Annapurna Mess"
                      />
                    ) : (
                      <p className="text-sm">{profile.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Food Type</label>
                    {isEditing ? (
                      <select
                        name="type"
                        value={editedProfile?.type || "both"}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="veg">Vegetarian Only</option>
                        <option value="non-veg">Non-vegetarian Only</option>
                        <option value="both">Both Veg and Non-veg</option>
                      </select>
                    ) : (
                      <p className="text-sm capitalize">
                        {profile.type === "veg"
                          ? "Vegetarian Only"
                          : profile.type === "non-veg"
                          ? "Non-vegetarian Only"
                          : "Both Veg and Non-veg"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    {isEditing ? (
                      <Input
                        name="location"
                        value={editedProfile?.location || ""}
                        onChange={handleChange}
                        placeholder="e.g., North Campus"
                      />
                    ) : (
                      <p className="text-sm">{profile.location}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Address</label>
                    {isEditing ? (
                      <Input
                        name="address"
                        value={editedProfile?.address || ""}
                        onChange={handleChange}
                        placeholder="e.g., 123, College Road, North Campus"
                      />
                    ) : (
                      <p className="text-sm">{profile.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Contact Number
                    </label>
                    {isEditing ? (
                      <Input
                        name="contactNumber"
                        value={editedProfile?.contactNumber || ""}
                        onChange={handleChange}
                        placeholder="e.g., +91 9876543210"
                      />
                    ) : (
                      <p className="text-sm">{profile.contactNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cuisine</label>
                    {isEditing ? (
                      <Input
                        name="cuisine"
                        value={
                          Array.isArray(editedProfile?.cuisine)
                            ? editedProfile.cuisine.join(", ")
                            : ""
                        }
                        onChange={(e) => {
                          if (editedProfile) {
                            setEditedProfile({
                              ...editedProfile,
                              cuisine: e.target.value
                                .split(",")
                                .map((item) => item.trim()),
                            });
                          }
                        }}
                        placeholder="e.g., North Indian, South Indian"
                      />
                    ) : (
                      <p className="text-sm">
                        {Array.isArray(profile.cuisine)
                          ? profile.cuisine.join(", ")
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={editedProfile?.description || ""}
                      onChange={(e) => {
                        if (editedProfile) {
                          setEditedProfile({
                            ...editedProfile,
                            description: e.target.value,
                          });
                        }
                      }}
                      placeholder="Describe your mess, specialties, and what makes it unique"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm">
                      {profile.description || "No description provided."}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mess Image</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload a logo or image for your mess (max 5MB, JPG/PNG)
                      </p>
                      {selectedImage && (
                        <p className="text-xs text-green-600">
                          Selected: {selectedImage.name}
                        </p>
                      )}
                      {profile.image && !selectedImage && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            Current image:
                          </p>
                          <Image
                            src={profile.image}
                            alt="Current mess image"
                            width={96}
                            height={96}
                            className="object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {profile.image ? (
                        <div className="space-y-2">
                          <Image
                            src={profile.image}
                            alt="Mess image"
                            width={128}
                            height={128}
                            className="object-cover rounded-lg border"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No image uploaded
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mess Plans</CardTitle>
                  <CardDescription>
                    Subscription plans you offer
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowPlanModal(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Plan
                </Button>
              </CardHeader>
              <CardContent>
                {profile.plans && profile.plans.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profile.plans.map((plan: Plan, index: number) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => handleDeletePlan(index)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                        <h3 className="font-medium text-lg">{plan.name}</h3>
                        <p className="text-muted-foreground text-sm">
                          {plan.description}
                        </p>
                        <p className="mt-2 font-semibold">₹{plan.price}</p>
                        <p className="text-xs text-muted-foreground">
                          {plan.duration} days
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No plans added yet. Add your subscription plans to attract
                      students.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => setShowPlanModal(true)}
                    >
                      Add Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Menu Management Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Menu Management</CardTitle>
                  <CardDescription>
                    Create and update your daily menus
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setMenuDate(new Date().toISOString().split("T")[0]);
                    setMenuItems([{ name: "", description: "", type: "veg" }]);
                    setShowMenuModal(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Menu
                </Button>
              </CardHeader>
              <CardContent>
                {profile.menu && profile.menu.length > 0 ? (
                  <Tabs defaultValue="weekly" className="w-full">
                    <TabsList>
                      <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                      <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>

                    {/* Weekly View Tab */}
                    <TabsContent value="weekly" className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {profile.menu
                          .slice()
                          .sort(
                            (a: MenuForDate, b: MenuForDate) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .slice(0, 7)
                          .map((menuItem: MenuForDate, index: number) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 hover:shadow-md group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 mb-3">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-medium text-sm">
                                    {formatDate(
                                      menuItem.date instanceof Date
                                        ? menuItem.date.toISOString()
                                        : menuItem.date
                                    )}
                                  </h3>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                  onClick={() => handleDeleteMenu(index)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {menuItem.items.map(
                                  (item: MenuItem, itemIndex: number) => (
                                    <div
                                      key={itemIndex}
                                      className="flex items-start gap-2 border-b pb-2 last:border-0"
                                    >
                                      <span
                                        className={`h-3 w-3 mt-1 rounded-full flex-shrink-0 ${
                                          item.type === "veg"
                                            ? "bg-green-500"
                                            : "bg-red-500"
                                        }`}
                                      />
                                      <div>
                                        <p className="font-medium">
                                          {item.name}
                                        </p>
                                        {item.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    {/* List View Tab */}
                    <TabsContent value="list" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        {profile.menu
                          .slice()
                          .sort(
                            (a: MenuForDate, b: MenuForDate) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .map((menuItem: MenuForDate, index: number) => (
                            <Card key={index} className="group">
                              <CardHeader className="flex flex-row items-center justify-between py-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-medium">
                                    {formatDate(
                                      menuItem.date instanceof Date
                                        ? menuItem.date.toISOString()
                                        : menuItem.date
                                    )}
                                  </h3>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                  onClick={() => handleDeleteMenu(index)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </CardHeader>
                              <CardContent className="py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {menuItem.items.map(
                                    (item: MenuItem, itemIndex: number) => (
                                      <div
                                        key={itemIndex}
                                        className="flex items-start gap-2 border rounded-md p-2"
                                      >
                                        <span
                                          className={`h-3 w-3 mt-1 rounded-full flex-shrink-0 ${
                                            item.type === "veg"
                                              ? "bg-green-500"
                                              : "bg-red-500"
                                          }`}
                                        />
                                        <div>
                                          <p className="font-medium">
                                            {item.name}
                                          </p>
                                          {item.description && (
                                            <p className="text-xs text-muted-foreground">
                                              {item.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center py-8">
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">
                      No menus added yet. Add your daily menus to inform
                      students what&apos;s cooking.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMenuDate(new Date().toISOString().split("T")[0]);
                        setMenuItems([
                          { name: "", description: "", type: "veg" },
                        ]);
                        setShowMenuModal(true);
                      }}
                      className="mt-2"
                    >
                      Add Today&apos;s Menu
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Add Plan Modal */}
        <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subscription Plan</DialogTitle>
              <DialogDescription>
                Create a new subscription plan for your mess
              </DialogDescription>
            </DialogHeader>

            {planError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-sm text-red-700">
                {planError}
              </div>
            )}

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Plan Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={currentPlan.name}
                  onChange={handlePlanChange}
                  placeholder="e.g., Basic, Standard, Premium"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Input
                  id="description"
                  name="description"
                  value={currentPlan.description}
                  onChange={handlePlanChange}
                  placeholder="e.g., Lunch only, Lunch and Dinner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price (₹) *
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={currentPlan.price === 0 ? "" : currentPlan.price}
                    onChange={handlePlanChange}
                    placeholder="e.g., 2000"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="duration" className="text-sm font-medium">
                    Duration (days) *
                  </label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    value={currentPlan.duration}
                    onChange={handlePlanChange}
                    placeholder="e.g., 30"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPlanModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPlan} disabled={loadingAction}>
                {loadingAction ? "Adding..." : "Add Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Menu Modal */}
        <Dialog open={showMenuModal} onOpenChange={setShowMenuModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add Daily Menu</DialogTitle>
              <DialogDescription>
                Set your menu items for a specific date
              </DialogDescription>
            </DialogHeader>

            {menuError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-sm text-red-700">
                {menuError}
              </div>
            )}

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="menuDate" className="text-sm font-medium">
                  Date *
                </label>
                <Input
                  id="menuDate"
                  name="menuDate"
                  type="date"
                  value={menuDate}
                  onChange={(e) => setMenuDate(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Menu Items *</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMenuItem}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </Button>
                </div>

                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-3 space-y-3 relative group"
                  >
                    {menuItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMenuItem(index)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium">
                          Item Name *
                        </label>
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            handleMenuItemChange(index, "name", e.target.value)
                          }
                          placeholder="e.g., Rice, Dal, Paneer Curry"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium">Type</label>
                        <select
                          value={item.type}
                          onChange={(e) =>
                            handleMenuItemChange(
                              index,
                              "type",
                              e.target.value as "veg" | "non-veg"
                            )
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="veg">Vegetarian</option>
                          <option value="non-veg">Non-vegetarian</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Description (optional)
                      </label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleMenuItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Served with raita and papad"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMenuModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveMenu} disabled={loadingAction}>
                {loadingAction ? "Saving..." : "Save Menu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

"use client";

import { useState, useEffect } from "react";
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
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  GripVertical,
  Upload,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Define types
interface MenuItem {
  name: string;
  description?: string;
  type: "veg" | "non-veg";
  image?: string;
  price?: number;
}

interface IndexItem {
  name: string;
  description?: string;
  type: "veg" | "non-veg";
  image?: string;
  price?: number;
}

interface MenuDay {
  date: Date;
  items: MenuItem[];
}

interface MessProfile {
  id: string;
  name: string;
  menu?: MenuDay[];
  itemsIndex?: IndexItem[];
  [key: string]: unknown;
}

export default function MenuManagement() {
  const [menu, setMenu] = useState<MenuDay[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditing, setIsEditing] = useState<{
    dayIndex: number;
    itemIndex: number;
  } | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      name: "",
      description: "",
      type: "veg",
      image: "",
      price: 0,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [menuDate, setMenuDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [messProfile, setMessProfile] = useState<MessProfile | null>(null);

  // New state for items index - Updated to use IndexItem objects with prices
  const [itemsIndex, setItemsIndex] = useState<IndexItem[]>([
    { name: "Roti", type: "veg", description: "Indian flatbread", price: 8 },
    { name: "Dal", type: "veg", description: "Lentil curry", price: 25 },
    {
      name: "Rice",
      type: "veg",
      description: "Steamed basmati rice",
      price: 20,
    },
    { name: "Curd", type: "veg", description: "Fresh yogurt", price: 15 },
    {
      name: "Mixed Vegetable Curry",
      type: "veg",
      description: "Seasonal vegetables in curry",
      price: 35,
    },
    {
      name: "Aloo Gobi",
      type: "veg",
      description: "Potato and cauliflower curry",
      price: 30,
    },
    {
      name: "Paneer Curry",
      type: "veg",
      description: "Cottage cheese in curry",
      price: 45,
    },
    {
      name: "Rajma",
      type: "veg",
      description: "Red kidney beans curry",
      price: 35,
    },
    {
      name: "Chana Masala",
      type: "veg",
      description: "Spiced chickpea curry",
      price: 30,
    },
    {
      name: "Sambar",
      type: "veg",
      description: "South Indian lentil curry",
      price: 25,
    },
    { name: "Rasam", type: "veg", description: "Tangy tomato soup", price: 20 },
    {
      name: "Pickle",
      type: "veg",
      description: "Traditional Indian pickle",
      price: 5,
    },
    {
      name: "Papad",
      type: "veg",
      description: "Crispy lentil wafer",
      price: 10,
    },
  ]);
  const [newIndexItem, setNewIndexItem] = useState<IndexItem>({
    name: "",
    description: "",
    type: "veg",
    image: "",
    price: 0,
  });
  const [isAddingIndexItem, setIsAddingIndexItem] = useState(false);
  const [editingIndexItem, setEditingIndexItem] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<IndexItem | null>(null);

  // New state for image uploads in index items
  const [indexUploadingImages, setIndexUploadingImages] = useState<{
    [key: number]: boolean;
  }>({});
  const [indexUploadErrors, setIndexUploadErrors] = useState<{
    [key: number]: string;
  }>({});

  // New state for image uploads
  const [uploadingImages, setUploadingImages] = useState<{
    [key: number]: boolean;
  }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: number]: string }>(
    {}
  );

  const { user } = useAuth();

  // Function to handle image upload
  const handleImageUpload = async (file: File, itemIndex: number) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadErrors((prev) => ({
        ...prev,
        [itemIndex]: "Please select a valid image file",
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((prev) => ({
        ...prev,
        [itemIndex]: "Image size should be less than 5MB",
      }));
      return;
    }

    setUploadingImages((prev) => ({ ...prev, [itemIndex]: true }));
    setUploadErrors((prev) => ({ ...prev, [itemIndex]: "" }));

    try {
      const filename = `menu-images/${Date.now()}-${file.name}`;

      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(filename)}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();

      // Update the menu item with the uploaded image URL
      const newItems = [...menuItems];
      newItems[itemIndex] = {
        ...newItems[itemIndex],
        image: result.url,
      };
      setMenuItems(newItems);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadErrors((prev) => ({
        ...prev,
        [itemIndex]: "Failed to upload image. Please try again.",
      }));
    } finally {
      setUploadingImages((prev) => ({ ...prev, [itemIndex]: false }));
    }
  };

  // Function to handle image upload for index items
  const handleIndexImageUpload = async (
    file: File,
    isNewItem: boolean = false
  ) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      if (isNewItem) {
        setIndexUploadErrors((prev) => ({
          ...prev,
          [-1]: "Please select a valid image file",
        }));
      }
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (isNewItem) {
        setIndexUploadErrors((prev) => ({
          ...prev,
          [-1]: "Image size should be less than 5MB",
        }));
      }
      return;
    }

    const key = isNewItem ? -1 : editingIndexItem ?? -1;
    setIndexUploadingImages((prev) => ({ ...prev, [key]: true }));
    setIndexUploadErrors((prev) => ({ ...prev, [key]: "" }));

    try {
      const filename = `index-images/${Date.now()}-${file.name}`;

      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(filename)}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();

      if (isNewItem) {
        setNewIndexItem((prev) => ({ ...prev, image: result.url }));
      } else if (editingIndexItem !== null) {
        const newIndex = [...itemsIndex];
        newIndex[editingIndexItem] = {
          ...newIndex[editingIndexItem],
          image: result.url,
        };
        setItemsIndex(newIndex);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setIndexUploadErrors((prev) => ({
        ...prev,
        [key]: "Failed to upload image. Please try again.",
      }));
    } finally {
      setIndexUploadingImages((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Fetch menu data
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch("/api/mess/profile");
        const data = await response.json();

        if (response.ok && data.mess) {
          // Store the full mess profile
          setMessProfile(data.mess);

          // If the menu exists, set it
          if (data.mess.menu && Array.isArray(data.mess.menu)) {
            // Sort menu by date (newest first)
            const sortedMenu = [...data.mess.menu].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setMenu(sortedMenu);
          }

          // If items index exists, set it - Updated to handle both old and new format
          if (data.mess.itemsIndex && Array.isArray(data.mess.itemsIndex)) {
            // Check if it's the old string format or new object format
            if (
              data.mess.itemsIndex.length > 0 &&
              typeof data.mess.itemsIndex[0] === "string"
            ) {
              // Convert old string format to new object format
              const convertedIndex = data.mess.itemsIndex.map(
                (item: string) => ({
                  name: item,
                  type: "veg" as const,
                  description: "",
                  image: "",
                })
              );
              setItemsIndex(convertedIndex);
            } else {
              setItemsIndex(data.mess.itemsIndex);
            }
          }
        } else {
          setError(data.error || "Failed to load menu data");
        }
      } catch {
        setError("Error fetching menu data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "mess-owner") {
      fetchMenuData();
    }
  }, [user]);

  // Save items index to backend - Updated to save IndexItem objects
  const saveItemsIndex = async (newIndex: IndexItem[]) => {
    if (!messProfile) return;

    try {
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Include all the required fields from the mess profile
          name: messProfile.name,
          type: messProfile.type,
          cuisine: messProfile.cuisine,
          lat: messProfile.lat,
          lng: messProfile.lng,
          address: messProfile.address,
          contactNumber: messProfile.contactNumber,
          description: messProfile.description,
          plans: messProfile.plans,
          menu: messProfile.menu,
          itemsIndex: newIndex,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessProfile(data.mess);
      }
    } catch (error) {
      console.error("Failed to save items index:", error);
    }
  };

  // Add new item to index - Updated for IndexItem objects with price
  const handleAddIndexItem = () => {
    if (
      newIndexItem.name.trim() &&
      !itemsIndex.find((item) => item.name === newIndexItem.name.trim())
    ) {
      const newIndex = [
        ...itemsIndex,
        { ...newIndexItem, name: newIndexItem.name.trim() },
      ];
      setItemsIndex(newIndex);
      setNewIndexItem({
        name: "",
        description: "",
        type: "veg",
        image: "",
        price: 0,
      });
      setIsAddingIndexItem(false);
      saveItemsIndex(newIndex);
    }
  };

  // Remove item from index - Updated for IndexItem objects
  const handleRemoveIndexItem = (index: number) => {
    const newIndex = itemsIndex.filter((_, i) => i !== index);
    setItemsIndex(newIndex);
    saveItemsIndex(newIndex);
  };

  // Update index item
  const handleUpdateIndexItem = (index: number, updatedItem: IndexItem) => {
    const newIndex = [...itemsIndex];
    newIndex[index] = updatedItem;
    setItemsIndex(newIndex);
    saveItemsIndex(newIndex);
    setEditingIndexItem(null);
  };

  // Drag and drop handlers - Updated for IndexItem objects with price
  const handleDragStart = (e: React.DragEvent, item: IndexItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const droppedItemData = e.dataTransfer.getData("text/plain");

    if (droppedItemData && draggedItem) {
      try {
        const droppedItem = JSON.parse(droppedItemData) as IndexItem;
        const newItems = [...menuItems];
        newItems[targetIndex] = {
          name: droppedItem.name,
          description: droppedItem.description || "",
          type: droppedItem.type,
          image: droppedItem.image || "",
          price: droppedItem.price || 0,
        };
        setMenuItems(newItems);
        setDraggedItem(null);
      } catch (error) {
        console.error("Error parsing dropped item:", error);
      }
    }
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const newItems = [...menuItems];

    // Convert price to number, keep other fields as strings
    const processedValue = name === "price" ? parseFloat(value) || 0 : value;

    newItems[index] = {
      ...newItems[index],
      [name]: processedValue,
    };
    setMenuItems(newItems);
  };

  const handleAddMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { name: "", description: "", type: "veg", image: "", price: 0 },
    ]);
    // Clear any upload errors for new item
    const newIndex = menuItems.length;
    setUploadErrors((prev) => ({ ...prev, [newIndex]: "" }));
  };

  const handleRemoveMenuItem = (index: number) => {
    if (menuItems.length === 1) {
      return; // Keep at least one item
    }
    const newItems = [...menuItems];
    newItems.splice(index, 1);
    setMenuItems(newItems);

    // Clear upload errors for this item
    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
    setUploadingImages((prev) => {
      const newUploading = { ...prev };
      delete newUploading[index];
      return newUploading;
    });
  };

  const handleEditItem = (dayIndex: number, itemIndex: number) => {
    const itemToEdit = menu[dayIndex].items[itemIndex];
    setIsEditing({ dayIndex, itemIndex });
    setMenuDate(new Date(menu[dayIndex].date).toISOString().split("T")[0]);
    setMenuItems([{ ...itemToEdit }]);
    setIsAddingItem(true);
  };

  const handleSaveMenu = async () => {
    // Validate each menu item
    const validItems = menuItems.filter((item) => item.name.trim() !== "");

    if (validItems.length === 0) {
      setMessage("At least one valid menu item with a name is required");
      return;
    }

    if (!menuDate) {
      setMessage("Date is required");
      return;
    }

    if (!messProfile) {
      setError("Unable to update menu: Mess profile not found");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Get existing menu or create empty array
      const existingMenu = [...menu];

      // Find if there's already a menu for this date
      const dateIndex = existingMenu.findIndex(
        (m) => new Date(m.date).toISOString().split("T")[0] === menuDate
      );

      let updatedMenu: MenuDay[] = [];

      if (isEditing) {
        // We're editing an existing item
        updatedMenu = [...existingMenu];
        const { dayIndex, itemIndex } = isEditing;

        // Replace the item being edited
        updatedMenu[dayIndex].items[itemIndex] = validItems[0];

        // If we have more than one item, add the rest
        if (validItems.length > 1) {
          for (let i = 1; i < validItems.length; i++) {
            updatedMenu[dayIndex].items.push(validItems[i]);
          }
        }
      } else if (dateIndex >= 0) {
        // Adding to existing date's menu
        updatedMenu = [...existingMenu];
        // Add all valid items to this date
        validItems.forEach((item) => {
          updatedMenu[dateIndex].items.push(item);
        });
      } else {
        // Add new date's menu with all valid items
        updatedMenu = [
          ...existingMenu,
          {
            date: new Date(menuDate),
            items: validItems,
          },
        ];
      }

      // Sort menu by date (newest first)
      updatedMenu.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // Make API call to update the menu, including all required profile fields
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Include all the required fields from the mess profile
          name: messProfile.name,
          type: messProfile.type,
          cuisine: messProfile.cuisine,
          lat: messProfile.lat,
          lng: messProfile.lng,
          address: messProfile.address,
          contactNumber: messProfile.contactNumber,
          description: messProfile.description,
          plans: messProfile.plans,
          itemsIndex: messProfile.itemsIndex,
          // Include the updated menu
          menu: updatedMenu,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update menu");
      }

      // Update the local state
      setMenu(data.mess.menu || []);
      setMessProfile(data.mess);
      setIsAddingItem(false);
      setIsEditing(null);
      setMenuItems([
        {
          name: "",
          description: "",
          type: "veg",
          image: "",
          price: 0,
        },
      ]);
      setSuccess(true);
      setMessage(
        isEditing
          ? "Menu item updated successfully"
          : "Menu items added successfully"
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(
        (err as Error).message || "Failed to update menu. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (dateIndex: number, itemIndex: number) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess(false);

    try {
      const updatedMenu = [...menu];

      // Remove the item from the menu
      updatedMenu[dateIndex].items.splice(itemIndex, 1);

      // If there are no more items for this date, remove the entire day
      if (updatedMenu[dateIndex].items.length === 0) {
        updatedMenu.splice(dateIndex, 1);
      }

      // Make API call to update the menu
      const response = await fetch("/api/mess/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menu: updatedMenu,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete menu item");
      }

      // Update the local state
      setMenu(data.mess.menu || []);
      setSuccess(true);
      setMessage("Item deleted successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(
        (err as Error).message ||
          "Failed to delete menu item. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAction = () => {
    setIsAddingItem(false);
    setIsEditing(null);
    setMenuItems([
      {
        name: "",
        description: "",
        type: "veg",
        image: "",
        price: 0,
      },
    ]);
    setError("");
    // Clear upload states
    setUploadingImages({});
    setUploadErrors({});
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

  return (
    <ProtectedRoute requiredRole="mess-owner">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Menu Management</h1>
              <p className="text-muted-foreground">
                Manage your daily menu offerings
              </p>
            </div>

            {!isAddingItem && (
              <Button onClick={() => setIsAddingItem(true)}>
                Add Menu Items
              </Button>
            )}
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
              <p className="text-green-700 text-sm">{message}</p>
            </div>
          )}

          {isAddingItem && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? "Edit Menu Item" : "Add Menu Items"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Update the details of this menu item"
                    : "Add one or more items to your menu for a specific date. You can drag items from the sidebar to quickly fill the item names."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                      type="date"
                      value={menuDate}
                      onChange={(e) => setMenuDate(e.target.value)}
                      disabled={isEditing !== null}
                    />
                  </div>

                  {menuItems.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-4 space-y-4 bg-gray-50"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Item {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            Drop item here
                          </span>
                          {menuItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMenuItem(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Item Name *
                          </label>
                          <Input
                            name="name"
                            value={item.name}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="e.g., Rice, Dal, Curry (or drag from sidebar)"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={item.description || ""}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="Describe the dish (optional)"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Type</label>
                          <select
                            name="type"
                            value={item.type}
                            onChange={(e) => handleItemChange(index, e)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="veg">Vegetarian</option>
                            <option value="non-veg">Non-Vegetarian</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Price (₹)
                          </label>
                          <Input
                            name="price"
                            type="number"
                            min="0"
                            step="1"
                            value={item.price || ""}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="Enter price in rupees"
                            className="text-sm"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="text-sm font-medium">
                            Image (optional)
                          </label>

                          {/* Current image preview */}
                          {item.image && (
                            <div className="relative">
                              <div className="relative w-full h-32 rounded border overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt="Current image"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-1 right-1 bg-white/80 hover:bg-white"
                                onClick={() => {
                                  const newItems = [...menuItems];
                                  newItems[index] = {
                                    ...newItems[index],
                                    image: "",
                                  };
                                  setMenuItems(newItems);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          {/* File upload */}
                          <div className="space-y-2">
                            <label className="text-xs text-gray-600">
                              Upload Image File
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, index);
                                  }
                                }}
                                className="hidden"
                                id={`file-input-${index}`}
                                disabled={uploadingImages[index]}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  document
                                    .getElementById(`file-input-${index}`)
                                    ?.click();
                                }}
                                disabled={uploadingImages[index]}
                              >
                                {uploadingImages[index] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Image
                                  </>
                                )}
                              </Button>
                            </div>
                            {uploadErrors[index] && (
                              <p className="text-xs text-red-600">
                                {uploadErrors[index]}
                              </p>
                            )}
                          </div>

                          {/* URL input */}
                          <div className="space-y-2">
                            <label className="text-xs text-gray-600">
                              Or Enter Image URL
                            </label>
                            <Input
                              name="image"
                              value={item.image || ""}
                              onChange={(e) => handleItemChange(index, e)}
                              placeholder="https://example.com/image.jpg"
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMenuItem}
                      className="w-full"
                    >
                      + Add Another Item
                    </Button>
                  )}

                  {/* Meal Price Summary */}
                  {menuItems.some((item) => item.name.trim() && item.price) && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600">💰</span>
                          <span className="font-medium text-emerald-800">
                            Meal Total
                          </span>
                        </div>
                        <span className="text-xl font-bold text-emerald-700">
                          ₹
                          {menuItems.reduce((total, item) => {
                            return item.name.trim()
                              ? total + (item.price || 0)
                              : total;
                          }, 0)}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600 mt-1">
                        Total price for{" "}
                        {menuItems.filter((item) => item.name.trim()).length}{" "}
                        items
                      </p>
                    </div>
                  )}

                  {message && !success && (
                    <p className="text-sm text-red-600">{message}</p>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={cancelAction}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveMenu} disabled={actionLoading}>
                      {actionLoading
                        ? "Saving..."
                        : isEditing
                        ? "Update Menu"
                        : "Save Menu Items"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : menu.length > 0 ? (
            <div className="space-y-8">
              {menu.map((day, dayIndex) => (
                <Card key={dayIndex}>
                  <CardHeader>
                    <CardTitle>{formatDate(day.date.toString())}</CardTitle>
                    <CardDescription>Menu items for this date</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {day.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group"
                        >
                          {item.image && (
                            <div className="relative h-40 w-full">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{item.name}</h3>
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  item.type === "veg"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.type === "veg" ? "Veg" : "Non-Veg"}
                              </span>
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-600 text-ellipsis overflow-hidden mb-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-lg font-bold text-emerald-600">
                                ₹{item.price || 0}
                              </p>
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-1/2"
                                onClick={() =>
                                  handleEditItem(dayIndex, itemIndex)
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-1/2"
                                onClick={() =>
                                  handleDeleteItem(dayIndex, itemIndex)
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t added any menu items yet.
                </p>
                <Button onClick={() => setIsAddingItem(true)}>
                  Add Your First Menu Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Items Index */}
        <div className="w-80 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl shadow-sm border border-slate-200/60 p-6 space-y-6 h-fit sticky top-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <span className="text-2xl">🍽️</span>
                Food Items Index
              </h3>
              <p className="text-sm text-slate-600 font-medium">
                {itemsIndex.length} items available
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm text-slate-700 leading-relaxed flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">💡</span>
              <span>
                <strong>Pro tip:</strong> Drag items from here to your menu form
                to quickly add them with all details pre-filled.
              </span>
            </p>
          </div>

          {/* Add new item to index */}
          <div className="space-y-3">
            {!isAddingIndexItem ? (
              <Button
                size="sm"
                onClick={() => setIsAddingIndexItem(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                variant="default"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            ) : (
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-lg">✨</span>
                  <h4 className="font-semibold text-slate-800">Add New Item</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1 block">
                      Item Name
                    </label>
                    <Input
                      placeholder="e.g., Butter Chicken, Paneer Tikka..."
                      value={newIndexItem.name}
                      onChange={(e) =>
                        setNewIndexItem((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1 block">
                      Description
                    </label>
                    <textarea
                      placeholder="Brief description of the dish..."
                      value={newIndexItem.description || ""}
                      onChange={(e) =>
                        setNewIndexItem((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1 block">
                      Type
                    </label>
                    <select
                      value={newIndexItem.type}
                      onChange={(e) =>
                        setNewIndexItem((prev) => ({
                          ...prev,
                          type: e.target.value as "veg" | "non-veg",
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-colors"
                    >
                      <option value="veg">🌱 Vegetarian</option>
                      <option value="non-veg">🍖 Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1 block">
                      Price (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Enter price..."
                      value={newIndexItem.price || ""}
                      onChange={(e) =>
                        setNewIndexItem((prev) => ({
                          ...prev,
                          price: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="text-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
                </div>

                {/* Image upload for new item */}
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-600 uppercase tracking-wide mb-1 block">
                    Image
                  </label>

                  {newIndexItem.image && (
                    <div className="relative group">
                      <div className="relative w-full h-24 rounded-lg border-2 border-slate-200 overflow-hidden">
                        <Image
                          src={newIndexItem.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
                        onClick={() =>
                          setNewIndexItem((prev) => ({ ...prev, image: "" }))
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleIndexImageUpload(file, true);
                        }
                      }}
                      className="hidden"
                      id="new-item-file-input"
                      disabled={indexUploadingImages[-1]}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      onClick={() =>
                        document.getElementById("new-item-file-input")?.click()
                      }
                      disabled={indexUploadingImages[-1]}
                    >
                      {indexUploadingImages[-1] ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <Input
                        placeholder="Or paste image URL..."
                        value={newIndexItem.image || ""}
                        onChange={(e) =>
                          setNewIndexItem((prev) => ({
                            ...prev,
                            image: e.target.value,
                          }))
                        }
                        className="text-xs border-slate-200 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {indexUploadErrors[-1] && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <span>⚠️</span>
                        {indexUploadErrors[-1]}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsAddingIndexItem(false);
                      setNewIndexItem({
                        name: "",
                        description: "",
                        type: "veg",
                        image: "",
                        price: 0,
                      });
                    }}
                    className="flex-1 border-slate-300 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddIndexItem}
                    disabled={!newIndexItem.name.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Item
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Items list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                <span className="text-sm">📋</span>
                Your Items
              </h4>
              {itemsIndex.length > 0 && (
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {itemsIndex.length} total
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
              {itemsIndex.map((item, index) => (
                <div
                  key={index}
                  className="animate-in slide-in-from-left duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {editingIndexItem === index ? (
                    // Edit mode
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-lg space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <span className="text-lg">✏️</span>
                        <h4 className="font-semibold text-slate-800">
                          Edit Item
                        </h4>
                      </div>

                      <Input
                        value={item.name}
                        onChange={(e) => {
                          const newIndex = [...itemsIndex];
                          newIndex[index] = {
                            ...newIndex[index],
                            name: e.target.value,
                          };
                          setItemsIndex(newIndex);
                        }}
                        className="text-sm border-slate-200 focus:border-blue-400"
                      />

                      <textarea
                        value={item.description || ""}
                        onChange={(e) => {
                          const newIndex = [...itemsIndex];
                          newIndex[index] = {
                            ...newIndex[index],
                            description: e.target.value,
                          };
                          setItemsIndex(newIndex);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        rows={2}
                        placeholder="Description"
                      />

                      <select
                        value={item.type}
                        onChange={(e) => {
                          const newIndex = [...itemsIndex];
                          newIndex[index] = {
                            ...newIndex[index],
                            type: e.target.value as "veg" | "non-veg",
                          };
                          setItemsIndex(newIndex);
                        }}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      >
                        <option value="veg">🌱 Vegetarian</option>
                        <option value="non-veg">🍖 Non-Vegetarian</option>
                      </select>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Enter price..."
                        value={item.price || ""}
                        onChange={(e) => {
                          const newIndex = [...itemsIndex];
                          newIndex[index] = {
                            ...newIndex[index],
                            price: parseFloat(e.target.value) || 0,
                          };
                          setItemsIndex(newIndex);
                        }}
                        className="text-sm border-slate-200 focus:border-blue-400"
                      />

                      {/* Image section for editing */}
                      <div className="space-y-3">
                        {item.image && (
                          <div className="relative group">
                            <div className="relative w-full h-24 rounded-lg border-2 border-slate-200 overflow-hidden">
                              <Image
                                src={item.image}
                                alt="Preview"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md"
                              onClick={() => {
                                const newIndex = [...itemsIndex];
                                newIndex[index] = {
                                  ...newIndex[index],
                                  image: "",
                                };
                                setItemsIndex(newIndex);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleIndexImageUpload(file);
                              }
                            }}
                            className="hidden"
                            id={`edit-item-file-input-${index}`}
                            disabled={indexUploadingImages[index]}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full border-dashed border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                            onClick={() =>
                              document
                                .getElementById(`edit-item-file-input-${index}`)
                                ?.click()
                            }
                            disabled={indexUploadingImages[index]}
                          >
                            {indexUploadingImages[index] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Image
                              </>
                            )}
                          </Button>

                          <Input
                            placeholder="Or paste image URL..."
                            value={item.image || ""}
                            onChange={(e) => {
                              const newIndex = [...itemsIndex];
                              newIndex[index] = {
                                ...newIndex[index],
                                image: e.target.value,
                              };
                              setItemsIndex(newIndex);
                            }}
                            className="text-xs border-slate-200 focus:border-blue-400"
                          />
                        </div>

                        {indexUploadErrors[index] && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <span>⚠️</span>
                              {indexUploadErrors[index]}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingIndexItem(null)}
                          className="flex-1 border-slate-300 hover:bg-slate-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateIndexItem(index, item)}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className="group relative bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md cursor-move transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-start gap-4 p-4">
                        {/* Drag handle */}
                        <div className="flex-shrink-0 mt-1">
                          <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                        </div>

                        {/* Image preview */}
                        {item.image && (
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 border-slate-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-slate-800 truncate">
                                  {item.name}
                                </span>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${
                                    item.type === "veg"
                                      ? "bg-green-100 text-green-700 border border-green-200"
                                      : "bg-red-100 text-red-700 border border-red-200"
                                  }`}
                                >
                                  {item.type === "veg"
                                    ? "🌱 Veg"
                                    : "🍖 Non-Veg"}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                              {item.price && (
                                <p className="text-xs font-semibold text-emerald-600 mt-1">
                                  ₹{item.price}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingIndexItem(index)}
                                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                title="Edit item"
                              >
                                <span className="text-sm">✏️</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveIndexItem(index)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                title="Delete item"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Drag indicator */}
                      <div className="absolute inset-0 rounded-xl border-2 border-dashed border-blue-300 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {itemsIndex.length === 0 && (
            <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border-2 border-dashed border-slate-200">
              <div className="space-y-3">
                <div className="text-4xl">🍽️</div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    No items in your index yet
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Add some items above to get started
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}

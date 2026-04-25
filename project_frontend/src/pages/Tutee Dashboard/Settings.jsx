import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard, Lock, Save, User, Shield, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Settings() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBioConfirmDialogOpen, setIsBioConfirmDialogOpen] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [localBookings, setLocalBookings] = useState([]);
  const [groupBookings, setGroupBookings] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  // Add these state variables with your existing useState declarations
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const pollingInterval = 30000; // 30 seconds

    const fetchAllBookings = async () => {
      try {
        await Promise.all([fetchBookings(), user?.id && fetchGroupBookings()]);
      } catch (error) {
        console.error("Error fetching bookings in polling:", error);
        if (isMounted) {
          toast.error("Failed to update bookings");
        }
      }
    };

    // Initial fetch
    if (user?.id) {
      fetchAllBookings();
    }

    // Set up polling interval
    const interval = setInterval(() => {
      if (user?.id) {
        fetchAllBookings();
      }
    }, pollingInterval);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]); // Add user.id dependency
  let isMounted = true;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // Fetch student data if user is available
        const response = await axios.get(`${BASE_URL}/api/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setStudent(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchStudent();
  }, [user]);

  useEffect(() => {
    if (student) {
      setNewEmail(student.email || "");
    }
  }, [student]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setLocalBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error; // Re-throw to handle in handleRefresh
    }
  };

  const fetchGroupBookings = async () => {
    try {
      console.log("Fetching group bookings for user:", user?.id);

      const response = await axios.get(
        `${BASE_URL}/api/group-sessions/student/my-group-sessions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data) {
        setGroupBookings(response.data);
      }
    } catch (error) {
      console.error("Unable to fetch group bookings:", error);
      throw error; // Re-throw to handle in handleRefresh
    }
  };

  const handleEmailChangeConfirmed = async () => {
    setIsConfirmDialogOpen(false);
    setIsUpdatingEmail(true);

    // Basic validation
    if (!newEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/users/email`,
        { newEmail },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setStudent((prev) => ({ ...prev, email: response.data.tutor.email }));
      setIsEditingEmail(false);
      setEmailError("");
      toast.success(`Email updated to ${response.data.tutor.email}`);
    } catch (error) {
      console.error("Error updating email:", error);
      setEmailError(error.response?.data?.message || "Failed to update email");
      toast.error(error.response?.data?.message || "Failed to update email");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleProfileImageChange = async () => {
    if (!profileImage) {
      toast.error("Please select an image");
      return;
    }

    setIsUpdatingProfile(true);
    const toastId = toast.loading("Uploading profile image...");

    const formData = new FormData();
    formData.append("profile", profileImage);
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/users/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the tutor state with the new profile image
      setStudent((prev) => ({
        ...prev,
        profileImage: response.data.student.profileImage, // Use the field name from your API response
      }));

      toast.success(
        response.data.message || "Profile image updated successfully",
        {
          id: toastId,
        }
      );

      setProfileDialogOpen(false);
      setProfileImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Updating error:", error);
      toast.error(
        error.response?.data?.error || "Failed to update profile image",
        {
          id: toastId,
        }
      );
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setPasswords((prev) => ({ ...prev, [id]: value }));
    // Clear error when user types
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { current: "", new: "", confirm: "" };

    if (!passwords.current) {
      newErrors.current = "Current password is required";
      valid = false;
    }

    if (!passwords.new) {
      newErrors.new = "New password is required";
      valid = false;
    } else if (passwords.new.length < 8) {
      newErrors.new = "Password must be at least 8 characters";
      valid = false;
    }

    if (passwords.new !== passwords.confirm) {
      newErrors.confirm = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handlePasswordChange = async () => {
    setIsDialogOpen(false);
    setIsUpdating(true);

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/users/password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.new,
          confirmPassword: passwords.confirm,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(response.data.message || "Password updated succesfully");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error(error.response.data.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsDialogOpen(true);
    }
  };

  // const payableBookings = localBookings.filter((b) => b.status === "completed");
  const payableBookings = localBookings.filter((b) => b.isPayable);
  if (loading) return <div>Loading...</div>;
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 border-1 border-[#3b2762]">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account">
            <Lock className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment
          </TabsTrigger>
        </TabsList>
        {/* Profile Settings */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-8">
                {/* Profile Picture Section - Centered and Larger */}
                <div className="space-y-4 text-center">
                  <Label
                    htmlFor="profile-picture"
                    className="text-lg font-medium"
                  >
                    Profile Picture
                  </Label>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-gray-200">
                      {student.profileImage ? (
                        <img
                          src={`${BASE_URL}/uploads/${student.profileImage}`}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => {
                        setProfileDialogOpen(true);
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                </div>

                {/* Name Fields - Below Profile Picture */}
                <div className="w-full max-w-md space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        value={student.firstName}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        value={student.lastName}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dialog popup after Change Photo */}
              <Dialog
                open={profileDialogOpen}
                onOpenChange={setProfileDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Profile Image</DialogTitle>
                    <DialogDescription>
                      Please upload a profile image.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setProfileImage(file);
                          // Create a preview URL for the image
                          const previewUrl = URL.createObjectURL(file);
                          setImagePreview(previewUrl);
                        }
                      }}
                    />

                    {/* Image Preview Section */}
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <div className="border rounded-md p-2">
                          <img
                            src={imagePreview}
                            alt="Profile preview"
                            className="max-h-64 mx-auto object-contain"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setProfileDialogOpen(false);
                          setProfileImage(null);
                          setImagePreview(null); // Clear preview on cancel
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleProfileImageChange}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Account Settings */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account details and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Login Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Login Information</h3>
                </div>
                {/* Change email */}
                <div className="space-y-4">
                  <Dialog
                    open={isConfirmDialogOpen}
                    onOpenChange={setIsConfirmDialogOpen}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center gap-2">
                        {isEditingEmail ? (
                          <>
                            <Input
                              id="email"
                              type="email"
                              value={newEmail}
                              onChange={(e) => {
                                setNewEmail(e.target.value);
                                setEmailError("");
                              }}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingEmail(false)}
                            >
                              Cancel
                            </Button>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={
                                  !newEmail.includes("@") || isUpdatingEmail
                                }
                              >
                                Save
                              </Button>
                            </DialogTrigger>
                          </>
                        ) : (
                          <>
                            <Input
                              id="email"
                              type="email"
                              value={student.email}
                              className="bg-muted/50 flex-1"
                              readOnly
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingEmail(true)}
                            >
                              Change Email
                            </Button>
                          </>
                        )}
                      </div>
                      {emailError && (
                        <p className="text-sm text-destructive">{emailError}</p>
                      )}
                    </div>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Email Change</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to change your email to{" "}
                          {newEmail}?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsConfirmDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleEmailChangeConfirmed}
                          disabled={isUpdatingEmail}
                        >
                          {isUpdatingEmail ? "Updating..." : "Confirm Change"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* Change Password */}
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Password Management</h4>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                      {/* Current Password */}
                      <div className="space-y-2">
                        <Label htmlFor="current">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="current"
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Enter your current password"
                            value={passwords.current}
                            onChange={handleChange}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label={
                              showCurrentPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showCurrentPassword ? (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.current && (
                          <p className="text-sm text-destructive">
                            {errors.current}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        {/* New Password */}
                        <div className="space-y-2">
                          <Label htmlFor="new">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new"
                              type={showNewPassword ? "text" : "password"}
                              placeholder="New password"
                              value={passwords.new}
                              onChange={handleChange}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                              aria-label={
                                showNewPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showNewPassword ? (
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          {errors.new && (
                            <p className="text-sm text-destructive">
                              {errors.new}
                            </p>
                          )}
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2">
                          <Label htmlFor="confirm">Confirm New Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Re-enter new password"
                              value={passwords.confirm}
                              onChange={handleChange}
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                              aria-label={
                                showConfirmPassword
                                  ? "Hide password"
                                  : "Show password"
                              }
                            >
                              {showConfirmPassword ? (
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.83 3.83"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          {errors.confirm && (
                            <p className="text-sm text-destructive">
                              {errors.confirm}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Dialog
                          open={isDialogOpen}
                          onOpenChange={setIsDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button type="submit" disabled={isUpdating}>
                              {isUpdating ? "Updating..." : "Update Password"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Password Change</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to change your password?
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handlePasswordChange}
                                disabled={isUpdating}
                              >
                                {isUpdating ? "Updating..." : "Confirm Change"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Payment History/Pending Payments*/}
        <TabsContent value="payment" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View your pending and completed payments for tutoring sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pending Payments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-amber-600">
                  Pending Payments
                </h3>
                {payableBookings.filter(
                  (booking) => booking.paymentStatus === "pending"
                ).length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-amber-700">No pending payments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payableBookings
                      .filter((booking) => booking.paymentStatus === "pending")
                      .map((booking) => (
                        <PaymentCard
                          key={booking._id}
                          booking={booking}
                          isPending={true}
                        />
                      ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Completed Payments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-green-600">
                  Completed Payments
                </h3>
                {payableBookings.filter(
                  (booking) => booking.paymentStatus === "paid"
                ).length === 0 ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-green-700">No completed payments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payableBookings
                      .filter((booking) => booking.paymentStatus === "paid")
                      .map((booking) => (
                        <PaymentCard
                          key={booking._id}
                          booking={booking}
                          isPending={false}
                        />
                      ))}
                  </div>
                )}
              </div>

              {/* Payment Instructions */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Payment Instructions
                </h4>
                <p className="text-sm text-blue-700">
                  For pending payments, please visit our office to complete your
                  payment in person. Bring the booking reference and exact
                  amount due. Office hours: Mon-Fri, 9AM-5PM.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const PaymentCard = ({ booking, isPending }) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTutorName = (tutor) => {
    if (!tutor) return "Unknown Tutor";

    // Try different possible property names
    if (tutor.name) return tutor.name;
    if (tutor.fullName) return tutor.fullName;
    if (tutor.firstName && tutor.lastName) {
      return `${tutor.firstName} ${tutor.lastName}`;
    }
    if (tutor.firstName) return tutor.firstName;

    return "Unknown Tutor";
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`rounded-lg border p-4 ${
        isPending
          ? "border-amber-300 bg-amber-50"
          : "border-green-300 bg-green-50"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isPending
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isPending ? "Pending Payment" : "Paid"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {booking.sessionType === "individual" ? "Individual" : "Group"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {booking.modality === "online" ? "Online" : "Face-to-Face"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Tutor:</span> {getTutorName(booking.tutor)}
            </div>
            <div>
              <span className="font-medium">Date:</span>{" "}
              {formatDate(booking.date)}
            </div>
            <div>
              <span className="font-medium">Time:</span>{" "}
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </div>
            <div>
              <span className="font-medium">Amount:</span> ₱{booking.price}
            </div>
            {booking.paidAt && (
              <div>
                <span className="font-medium">Paid on:</span>{" "}
                {formatDate(booking.paidAt)}
              </div>
            )}
          </div>

          <div className="mt-2">
            <span className="font-medium text-sm">Topic:</span>
            <p className="text-sm text-gray-600">{booking.topic}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Details" : "View Details"}
          </Button>
          {isPending && (
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Pay at Office
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-medium mb-3">Booking Details</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Session Type:</span>{" "}
                {booking.sessionType}
              </div>
              <div>
                <span className="font-medium">Modality:</span>{" "}
                {booking.modality}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-1 ${
                    booking.status === "completed"
                      ? "text-green-600"
                      : booking.status === "confirmed"
                      ? "text-blue-600"
                      : booking.status === "pending"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </span>
              </div>
              {booking.specialInstructions && (
                <div>
                  <span className="font-medium">Special Instructions:</span>
                  <p className="text-gray-600 mt-1">
                    {booking.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {booking.modality === "face-to-face" &&
                booking.locationDetails && (
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="text-gray-600 mt-1">
                      {booking.locationDetails}
                    </p>
                  </div>
                )}
              {/* {booking.modality === "online" && booking.meetingLink && (
                <div>
                  <span className="font-medium">Meeting Link:</span>
                  <a
                    href={booking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline block mt-1"
                  >
                    Join Session
                  </a>
                </div>
              )}
              {booking.groupSession?.isGroup && (
                <div>
                  <span className="font-medium">Group Session:</span>
                  <p className="text-gray-600">
                    {booking.groupSession.currentParticipants}/
                    {booking.groupSession.maxParticipants} participants
                  </p>
                </div>
              )} */}
              {booking.createdAt && (
                <div>
                  <span className="font-medium">Booked on:</span>{" "}
                  {formatDate(booking.createdAt)}
                </div>
              )}
            </div>
          </div>

          {/* Payment Instructions for Pending Payments */}
          {isPending && (
            <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-md">
              <h6 className="font-medium text-amber-800 mb-1">
                Payment Required
              </h6>
              <p className="text-sm text-amber-700">
                Please visit our office to complete your payment of ₱
                {booking.price}. Bring this booking reference:{" "}
                <strong>{booking._id.slice(-6).toUpperCase()}</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

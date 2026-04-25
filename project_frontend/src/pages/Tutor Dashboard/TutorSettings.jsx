import { Badge } from "@/components/ui/badge";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
import {
  BellRing,
  CreditCard,
  Lock,
  Save,
  User,
  Edit,
  X,
  Shield,
  ShieldCheck,
  Phone,
  Mail,
  MessageSquare,
  Search,
  Loader,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { RiMessengerLine } from "react-icons/ri";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TutorSettings = () => {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBioContent, setEditedBioContent] = useState("");

  const [bioCharCount, setBioCharCount] = useState(0);
  const [bioError, setBioError] = useState("");

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBioConfirmDialogOpen, setIsBioConfirmDialogOpen] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);

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

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    contactEmail: "",
    messenger: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    expertise: [],
  });

  const [expertiseOptions, setExpertiseOptions] = useState([]);
  const [loadingExpertise, setLoadingExpertise] = useState(true);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Add these state variables with your existing useState declarations
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch expertise options from API
  useEffect(() => {
    const fetchExpertiseOptions = async () => {
      try {
        setLoadingExpertise(true);
        const response = await axios.get(`${BASE_URL}/api/expertise/options`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // Extract just the names from the expertise objects
        const expertiseNames = response.data.map((item) => item.name);
        setExpertiseOptions(expertiseNames);
      } catch (error) {
        console.error("Error fetching expertise options:", error);
        toast.error("Failed to load expertise options");
        // Fallback to empty array if API fails
        setExpertiseOptions([]);
      } finally {
        setLoadingExpertise(false);
      }
    };

    fetchExpertiseOptions();
  }, []);

  // Filter expertise options based on search query
  const filteredExpertiseOptions = expertiseOptions.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tutorResponse = await axios.get(
          `${BASE_URL}/api/tutors/${user.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTutor(tutorResponse.data);
        // Initialize formData with tutor's existing expertise
        if (tutorResponse.data.expertise) {
          setFormData((prev) => ({
            ...prev,
            expertise: Array.isArray(tutorResponse.data.expertise)
              ? tutorResponse.data.expertise
              : [],
          }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (tutor) {
      setEditedBioContent(tutor.description || "");
      setBioCharCount(tutor.description?.length || 0);
    }
  }, [tutor]);

  useEffect(() => {
    if (tutor) {
      setNewEmail(tutor.email || "");
    }
  }, [tutor]);

  useEffect(() => {
    if (tutor) {
      setContactInfo({
        phone: tutor.contactInfo?.phone || "",
        contactEmail: tutor.contactInfo?.contactEmail || "",
        messenger: tutor.contactInfo?.messenger || "",
      });
    }
  }, [tutor]);

  const handleExpertiseToggle = (expertise) => {
    setFormData((prevData) => {
      if (prevData.expertise.includes(expertise)) {
        return {
          ...prevData,
          expertise: prevData.expertise.filter((item) => item !== expertise),
        };
      } else {
        return {
          ...prevData,
          expertise: [...prevData.expertise, expertise],
        };
      }
    });
  };

  const removeExpertise = (expertise) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((item) => item !== expertise),
    }));
  };

  const handleSaveExpertise = async () => {
    // Frontend validation
    if (formData.expertise.length === 0) {
      toast.error("Please select at least one area of expertise");
      return;
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/tutors/expertise`,
        { expertise: formData.expertise },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTutor((prev) => ({
        ...prev,
        expertise: response.data.tutor.expertise,
      }));
      toast.success("Expertise updated successfully");
    } catch (error) {
      console.error("Error updating expertise:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update expertise";
      toast.error(errorMessage);

      // If the error is about empty expertise, reset the form
      if (errorMessage.includes("At least one area of expertise is required")) {
        // Optionally handle this case
      }
    }
  };

  const handleEmailChangeConfirmed = async () => {
    setIsConfirmDialogOpen(false);
    setIsUpdatingEmail(true);

    if (!newEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/tutors/email`,
        { newEmail },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTutor((prev) => ({ ...prev, email: response.data.tutor.email }));
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

  const handleBioChange = (e) => {
    const value = e.target.value;
    setEditedBioContent(value);
    const count = value.length;
    setBioCharCount(count);

    if (count > 0 && count < 50) {
      setBioError(
        `Bio must be at least 50 characters (${50 - count} more needed)`
      );
    } else {
      setBioError("");
    }
  };

  const handleSaveBioConfirmed = async () => {
    setIsBioConfirmDialogOpen(false);
    setIsSavingBio(true);

    try {
      const response = await axios.patch(
        `${BASE_URL}/api/tutors/bio`,
        { bio: editedBioContent },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTutor((prev) => ({
        ...prev,
        description: response.data.tutor.description,
      }));
      setIsEditingBio(false);
      setBioError("");
      toast.success("Bio updated successfully");
    } catch (error) {
      console.error("Error updating bio:", error);
      setBioError(error.response?.data?.message || "Failed to update bio");
      toast.error(error.response?.data?.message || "Failed to update bio");
    } finally {
      setIsSavingBio(false);
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
        `${BASE_URL}/api/tutors/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update the tutor state with the new profile image
      setTutor((prev) => ({
        ...prev,
        profileImage: response.data.tutor?.profileImage, // Use the field name from your API response
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

    if (!passwords.confirm) {
      newErrors.confirm = "Please confirm your new password";
      valid = false;
    } else if (passwords.new !== passwords.confirm) {
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
        `${BASE_URL}/api/tutors/password`,
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

      toast.success(response.data.message || "Password updated successfully");
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

  const handleSaveContactInfo = async () => {
    try {
      if (
        !contactInfo.phone &&
        !contactInfo.contactEmail &&
        !contactInfo.messenger
      ) {
        toast.error("Please provide at least one contact method");
        return;
      }

      const response = await axios.patch(
        `${BASE_URL}/api/tutors/contact`,
        { contactInfo },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTutor((prev) => ({
        ...prev,
        contactInfo: response.data.tutor.contactInfo,
      }));
      setIsEditingContact(false);
      toast.success("Contact information updated successfully");
    } catch (error) {
      console.error("Error updating contact info:", error);
      toast.error(
        error.response?.data?.message || "Failed to update contact information"
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!tutor) return <div>Error loading tutor data</div>;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border-1 border-[#3b2762]">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account">
            <Lock className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col gap-8 md:flex-row">
                {/* Profile Picture Section */}
                <div className="space-y-3 md:w-1/4">
                  <Label htmlFor="profile-picture">Profile Picture</Label>
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border">
                      {tutor.profileImage ? (
                        <img
                          src={`${BASE_URL}/uploads/${tutor.profileImage}`}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                          {/* Replace with your preferred icon component */}
                          <User className="h-8 w-8 text-gray-400" />
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

                {/* Personal Information Section */}
                <div className="space-y-6 md:w-3/4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        readOnly
                        defaultValue={tutor.firstName}
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        readOnly
                        defaultValue={tutor.lastName}
                        className="bg-muted/50"
                      />
                    </div>
                  </div>

                  {/* Editable Bio Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio">Bio</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingBio(!isEditingBio)}
                        className="h-8"
                      >
                        {isEditingBio ? (
                          <>
                            <X className="mr-2 h-3.5 w-3.5" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            Edit Bio
                          </>
                        )}
                      </Button>
                    </div>
                    {isEditingBio ? (
                      <>
                        <Textarea
                          id="bio"
                          placeholder="Tell students about yourself..."
                          value={editedBioContent}
                          onChange={handleBioChange}
                          className="min-h-[120px]"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <div className="text-sm text-muted-foreground">
                            {bioCharCount}/500 characters
                            {bioError && (
                              <span className="text-destructive ml-2">
                                {bioError}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            {bioCharCount >= 50 ? (
                              <span className="text-green-500">
                                ✓ Minimum reached
                              </span>
                            ) : (
                              <span className="text-destructive">
                                {50 - bioCharCount} more characters needed
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingBio(false)}
                          >
                            Cancel
                          </Button>
                          <Dialog
                            open={isBioConfirmDialogOpen}
                            onOpenChange={setIsBioConfirmDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                disabled={!!bioError || bioCharCount === 0}
                              >
                                <Save className="mr-2 h-3.5 w-3.5" />
                                Save Bio
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Bio Update</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to update your profile
                                  bio?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p className="text-sm text-muted-foreground mb-2">
                                  New bio content:
                                </p>
                                <div className="p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
                                  {editedBioContent || (
                                    <span className="text-muted-foreground">
                                      (Empty)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    setIsBioConfirmDialogOpen(false)
                                  }
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSaveBioConfirmed}
                                  disabled={isSavingBio}
                                >
                                  {isSavingBio ? "Saving..." : "Confirm Update"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </>
                    ) : (
                      <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
                        {tutor.description || (
                          <p className="text-muted-foreground">
                            No bio provided yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expertise Section */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#3b2762] flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                      />
                    </svg>
                    Areas of Expertise
                  </h3>
                  <Button
                    onClick={handleSaveExpertise}
                    size="sm"
                    className="bg-[#3b2762] hover:bg-[#4c3580]"
                    disabled={formData.expertise.length === 0}
                  >
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Save Expertise
                  </Button>
                </div>

                <div className="relative">
                  <div className="flex items-center border border-gray-300 rounded-lg p-2.5 mb-3">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <Input
                      type="text"
                      placeholder="Search expertise areas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full focus:outline-none text-sm border-none focus:ring-0 p-0"
                    />
                  </div>

                  <div className="max-h-36 overflow-y-auto border border-gray-300 rounded-lg mb-3">
                    {loadingExpertise ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Loading expertise options...
                      </div>
                    ) : filteredExpertiseOptions.length > 0 ? (
                      filteredExpertiseOptions.map((option) => (
                        <div
                          key={option}
                          className={`flex items-center p-2.5 hover:bg-gray-100 cursor-pointer text-sm ${
                            formData.expertise.includes(option)
                              ? "bg-[#3b2762]/10"
                              : ""
                          }`}
                          onClick={() => handleExpertiseToggle(option)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.expertise.includes(option)}
                            readOnly
                            className="mr-2 accent-[#3b2762]"
                          />
                          <span>{option}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2.5 text-gray-500 text-center text-sm">
                        {expertiseOptions.length === 0
                          ? "No expertise options available. Please contact support."
                          : "No matching expertise found"}
                      </div>
                    )}
                  </div>
                </div>

                {formData.expertise.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-sm text-gray-600 mb-2 block">
                      Selected Expertise ({formData.expertise.length})
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.expertise.map((item) => (
                        <Badge
                          key={item}
                          variant="secondary"
                          className="bg-[#3b2762]/10 text-[#3b2762] px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => removeExpertise(item)}
                            className="ml-1 text-[#3b2762] hover:text-[#3b2762]/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!loadingExpertise && expertiseOptions.length === 0 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    Unable to load expertise options. Please try refreshing the
                    page or contact support.
                  </div>
                )}
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
                        const file = e.target.files[0]; // Also fixed typo here (was 'filed' instead of 'files')
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
                            alt="Proof preview"
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

        <TabsContent value="account" className="mt-6">
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
                              value={tutor.email}
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
                            onClick={() => setShowNewPassword(!showNewPassword)}
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
                          <Button
                            type="submit"
                            disabled={
                              isUpdating ||
                              !passwords.current ||
                              !passwords.new ||
                              !passwords.confirm
                            }
                          >
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

              <Separator />

              {/* Contact Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingContact(!isEditingContact)}
                    className="ml-auto"
                  >
                    {isEditingContact ? (
                      <>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </>
                    )}
                  </Button>
                </div>

                {isEditingContact ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+63 9xx xxx xxxx"
                          value={contactInfo.phone || ""}
                          onChange={(e) =>
                            setContactInfo({
                              ...contactInfo,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="contact@example.com"
                        value={contactInfo.contactEmail || ""}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            contactEmail: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="messenger">Messenger</Label>
                      <Input
                        id="messenger"
                        type="text"
                        placeholder="https://m.me/username"
                        value={contactInfo.messenger || ""}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            messenger: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditingContact(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveContactInfo}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{tutor.contactInfo?.phone || "Not provided"}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {tutor.contactInfo?.contactEmail || "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <RiMessengerLine className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {tutor.contactInfo?.messenger || "Not provided"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TutorSettings;

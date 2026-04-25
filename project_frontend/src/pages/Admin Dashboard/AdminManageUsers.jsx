import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Copy,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminManageUsers = () => {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);

  const [resettingEmail, setResettingEmail] = useState(null);

  const [resetDialogOpenStudent, setResetDialogOpenStudent] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isResettingStudent, setIsResettingStudent] = useState(false);

  // New state for success dialogs
  const [tutorSuccessDialogOpen, setTutorSuccessDialogOpen] = useState(false);
  const [studentSuccessDialogOpen, setStudentSuccessDialogOpen] =
    useState(false);
  const [newTutorPassword, setNewTutorPassword] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("");
  const [showTutorPassword, setShowTutorPassword] = useState(false);
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userType, setUserType] = useState(""); // 'student' or 'tutor'

  // Add these state variables to your existing component state
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    userType: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [userToCreate, setUserToCreate] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);
  const [userTypeToUpdate, setUserTypeToUpdate] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Add this function to handle form input changes
  const handleAddUserFormChange = (field, value) => {
    setAddUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate email when first name or last name changes
    if (
      (field === "firstName" || field === "lastName") &&
      addUserForm.userType
    ) {
      const newForm = {
        ...addUserForm,
        [field]: value,
      };

      if (newForm.firstName && newForm.lastName) {
        const generatedEmail = generateEmail(
          newForm.firstName,
          newForm.lastName,
          newForm.userType
        );
        setAddUserForm((prev) => ({
          ...prev,
          email: generatedEmail,
        }));
      }
    }

    // Auto-generate password and email when user type changes
    if (field === "userType" && value) {
      const newPassword = generateTemporaryPassword();
      setAddUserForm((prev) => ({
        ...prev,
        password: newPassword,
        email:
          prev.firstName && prev.lastName
            ? generateEmail(prev.firstName, prev.lastName, value)
            : "",
      }));
    }
  };

  // Function to generate email from first and last name
  const generateEmail = (firstName, lastName, userType) => {
    // Clean and format names
    const cleanFirstName = firstName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_") // Replace spaces with underscores for multiple first names
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents

    const cleanLastName = lastName
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents

    const domain =
      userType === "tutor" ? "tutorconnect.com" : "student.tutorconnect.com";

    return `${cleanFirstName}.${cleanLastName}@${domain}`;
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setStudents(res.data);
      setFilteredStudents(res.data); // Initialize filtered students
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/tutors/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setTutors(res.data);
      setFilteredTutors(res.data); // Initialize filtered tutors
    } catch (err) {
      console.error("Error fetching tutors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/bookings/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter students and tutors based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
      setFilteredTutors(tutors);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();

      // Filter students
      const filteredStudentsData = students.filter(
        (student) =>
          student.name?.toLowerCase().includes(lowercasedSearch) ||
          student.email?.toLowerCase().includes(lowercasedSearch) ||
          student._id?.toLowerCase().includes(lowercasedSearch)
      );

      // Filter tutors
      const filteredTutorsData = tutors.filter(
        (tutor) =>
          tutor.name?.toLowerCase().includes(lowercasedSearch) ||
          tutor.email?.toLowerCase().includes(lowercasedSearch) ||
          tutor._id?.toLowerCase().includes(lowercasedSearch) ||
          tutor.expertise?.some((skill) =>
            skill.toLowerCase().includes(lowercasedSearch)
          )
      );

      setFilteredStudents(filteredStudentsData);
      setFilteredTutors(filteredTutorsData);
    }
  }, [searchTerm, students, tutors]);

  const getPendingPaymentCountStudent = (studentId) => {
    return bookings.filter(
      (booking) =>
        booking.student._id.toString() === studentId.toString() &&
        (booking.status === "completed" || booking.status === "confirmed" || booking.status === "pending") &&
        booking.isPayable && booking.paymentStatus === "pending"
    ).length;
  };

  const getSessionsCompletedCount = (tutorId) => {
    const completedSessions = bookings.filter((booking) => {
      return (
        booking.tutor._id.toString() === tutorId.toString() &&
        booking.status === "completed"
      );
    });
    return completedSessions.length;
  };

  const getSessionsBookedCountStudent = (studentId) => {
    return bookings.filter(
      (booking) => booking.student._id.toString() === studentId.toString()
    ).length;
  };

  const getSessionsCompletedCountStudent = (studentId) => {
    return bookings.filter(
      (booking) =>
        booking.student._id.toString() === studentId.toString() &&
        booking.status === "completed"
    ).length;
  };

  const getSessionsCancelledExpiredCountStudent = (studentId) => {
    return bookings.filter(
      (booking) =>
        booking.student._id.toString() === studentId.toString() &&
        (booking.status === "cancelled" || booking.status === "expired")
    ).length;
  };

  const getSessionsConfirmedCountStudent = (studentId) => {
    return bookings.filter(
      (booking) =>
        booking.student._id.toString() === studentId.toString() &&
        booking.status === "confirmed"
    ).length;
  };

  const getPendingRequestsCountStudent = (studentId) => {
    return bookings.filter(
      (booking) =>
        booking.student._id.toString() === studentId.toString() &&
        booking.status === "pending"
    ).length;
  };

  // Toggle student active status
  const toggleStudentStatus = async (studentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;

      const response = await axios.patch(
        `${BASE_URL}/api/users/${studentId}/status`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toast.success(
          `Student ${newStatus ? "activated" : "deactivated"} successfully`
        );
        // Refresh the students list
        fetchStudents();
      }
    } catch (error) {
      console.error("Error updating student status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update student status"
      );
    }
  };

  // Toggle tutor active status
  const toggleTutorStatus = async (tutorId, currentStatus) => {
    try {
      const newStatus = !currentStatus;

      const response = await axios.patch(
        `${BASE_URL}/api/tutors/${tutorId}/status`,
        { isActive: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        toast.success(
          `Tutor ${newStatus ? "activated" : "deactivated"} successfully`
        );
        // Refresh the tutors list
        fetchTutors();
      }
    } catch (error) {
      console.error("Error updating tutor status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update tutor status"
      );
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!userToUpdate || !userTypeToUpdate) return;

    setIsUpdatingStatus(true);
    try {
      if (userTypeToUpdate === "student") {
        await toggleStudentStatus(userToUpdate._id, userToUpdate.isActive);
      } else if (userTypeToUpdate === "tutor") {
        await toggleTutorStatus(userToUpdate._id, userToUpdate.isActive);
      }
      setStatusDialogOpen(false);
      setUserToUpdate(null);
      setUserTypeToUpdate("");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResetTutorPassword = async (email) => {
    if (!selectedTutor) return;

    setIsResetting(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/admin/resetTutorPassword`,
        { email: selectedTutor.email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNewTutorPassword(response.data.newPassword);
      setResetDialogOpen(false);
      setTutorSuccessDialogOpen(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetStudentPassword = async (email) => {
    if (!selectedStudent) return;

    setIsResettingStudent(true);
    try {
      const response = await axios.patch(
        `${BASE_URL}/api/admin/resetStudentPassword`,
        { email: selectedStudent.email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNewStudentPassword(response.data.newPassword);
      setResetDialogOpenStudent(false);
      setStudentSuccessDialogOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResettingStudent(false);
    }
  };

  const handleTutorSuccessClose = () => {
    setTutorSuccessDialogOpen(false);
    setSelectedTutor(null);
    setNewTutorPassword("");
    setShowTutorPassword(false);
  };

  const handleStudentSuccessClose = () => {
    setStudentSuccessDialogOpen(false);
    setSelectedStudent(null);
    setNewStudentPassword("");
    setShowStudentPassword(false);
  };

  const handleViewProfile = (user, type) => {
    setSelectedUser(user);
    setUserType(type);
    setProfileDialogOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // Add this function to generate a random temporary password
  const generateTemporaryPassword = () => {
    const length = 10;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Updated function to handle user creation confirmation
  const handleCreateUserConfirmation = () => {
    // Validation
    if (!addUserForm.userType) {
      toast.error("Please select user type");
      return;
    }
    if (!addUserForm.firstName || !addUserForm.lastName) {
      toast.error("Please enter full name");
      return;
    }

    // Set the user data for confirmation
    setUserToCreate({ ...addUserForm });
    setConfirmationDialogOpen(true);
  };

  // Function to actually create the user after confirmation
  const handleCreateUser = async () => {
    if (!userToCreate) return;

    try {
      setAddUserLoading(true);
      setConfirmationDialogOpen(false);

      if (userToCreate.userType === "student") {
        // Create student
        const studentData = {
          firstName: userToCreate.firstName,
          lastName: userToCreate.lastName,
          email: userToCreate.email,
          password: userToCreate.password,
          role: "student",
        };

        const response = await axios.post(
          `${BASE_URL}/api/users/register`,
          studentData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          toast.success(
            `Student ${userToCreate.firstName} ${userToCreate.lastName} created successfully!`
          );
          // Refresh students list
          fetchStudents();
        }
      } else if (userToCreate.userType === "tutor") {
        // Create tutor with minimal required data
        const tutorData = {
          firstName: userToCreate.firstName,
          lastName: userToCreate.lastName,
          email: userToCreate.email,
          password: userToCreate.password,
          role: "tutor",
          expertise: JSON.stringify([]), // Default expertise
          schedule: JSON.stringify({
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
          }),
        };

        const response = await axios.post(
          `${BASE_URL}/api/tutors/registerTutor`,
          tutorData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          toast.success(
            `Tutor ${userToCreate.firstName} ${userToCreate.lastName} created successfully!`
          );
          // Refresh tutors list
          fetchTutors();
        }
      }

      // Reset form
      setAddUserForm({
        userType: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setShowGeneratedPassword(false);
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create user. Please try again.";
      toast.error(errorMessage);
    } finally {
      setAddUserLoading(false);
      setUserToCreate(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!bookings) return <div>No bookings data loaded</div>;
  if (!tutors) return <div>No tutors data loaded</div>;

  return (
    <div className="space-y-6">
      {/* Search bar and Add user */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search users by name, email, or ID"
            className="w-70"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Button variant="outline" size="icon" onClick={clearSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new student or tutor account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* User Type Selection */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="userType"
                  className="text-right text-sm font-medium"
                >
                  User Type
                </label>
                <Select
                  value={addUserForm.userType}
                  onValueChange={(value) =>
                    handleAddUserFormChange("userType", value)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="firstName"
                  className="text-right text-sm font-medium"
                >
                  First Name
                </label>
                <Input
                  id="firstName"
                  placeholder="First Name"
                  value={addUserForm.firstName}
                  onChange={(e) =>
                    handleAddUserFormChange("firstName", e.target.value)
                  }
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="lastName"
                  className="text-right text-sm font-medium"
                >
                  Last Name
                </label>
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  value={addUserForm.lastName}
                  onChange={(e) =>
                    handleAddUserFormChange("lastName", e.target.value)
                  }
                  className="col-span-3"
                />
              </div>

              {/* Auto-generated Email Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="email"
                  className="text-right text-sm font-medium"
                >
                  Email
                </label>
                <div className="col-span-3">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email will be auto-generated"
                    value={addUserForm.email}
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email is automatically generated from the name
                  </p>
                </div>
              </div>

              {/* Auto-generated Password Field */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="password"
                  className="text-right text-sm font-medium"
                >
                  Password
                </label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="password"
                      type={showGeneratedPassword ? "text" : "password"}
                      placeholder="Password will be auto-generated"
                      value={addUserForm.password}
                      readOnly
                      className="flex-1 bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setShowGeneratedPassword(!showGeneratedPassword)
                      }
                    >
                      {showGeneratedPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPassword = generateTemporaryPassword();
                        setAddUserForm((prev) => ({
                          ...prev,
                          password: newPassword,
                        }));
                      }}
                    >
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Secure password is automatically generated
                  </p>
                </div>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateUserConfirmation}
                disabled={
                  addUserLoading ||
                  !addUserForm.userType ||
                  !addUserForm.firstName ||
                  !addUserForm.lastName
                }
                className="w-full"
              >
                {addUserLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating User...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rest of your existing tabs and tables remain the same */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border border-[#3b2762]">
          <TabsTrigger value="students">
            Students{" "}
            {filteredStudents.length > 0 && `(${filteredStudents.length})`}
          </TabsTrigger>
          <TabsTrigger value="tutors">
            Tutors {filteredTutors.length > 0 && `(${filteredTutors.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Students Tab Content - unchanged */}
        <TabsContent value="students">
          <Card className="border border-[#3b2762]">
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage student accounts and view their activity.
                {searchTerm &&
                  ` Showing ${filteredStudents.length} of ${students.length} students`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No students found matching your search."
                    : "No students found."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead> {/* Add this */}
                      <TableHead>Join Date</TableHead>
                      <TableHead>Pending Payments</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell className="font-medium">
                          {student._id.slice(-6).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  `${BASE_URL}/uploads/${student.profileImage}` ||
                                  "/placeholder.svg"
                                }
                                alt={student.name}
                              />
                              <AvatarFallback>
                                {student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={student.isActive ? "default" : "secondary"}
                            className={
                              student.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(student.createdAt), "MMMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {getPendingPaymentCountStudent(student._id)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewProfile(student, "student")
                                }
                              >
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setResetDialogOpenStudent(true);
                                }}
                              >
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToUpdate(student);
                                  setUserTypeToUpdate("student");
                                  setStatusDialogOpen(true);
                                }}
                                className={
                                  student.isActive
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }
                              >
                                {student.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutors Tab Content - unchanged */}
        <TabsContent value="tutors">
          <Card className="border border-[#3b2762]">
            <CardHeader>
              <CardTitle>Tutors</CardTitle>
              <CardDescription>
                Manage tutor accounts and view their performance.
                {searchTerm &&
                  ` Showing ${filteredTutors.length} of ${tutors.length} tutors`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTutors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm
                    ? "No tutors found matching your search."
                    : "No tutors found."}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Status</TableHead> {/* Add this */}
                      <TableHead>Join Date</TableHead>
                      <TableHead>Expertise</TableHead>
                      {/* <TableHead>Sessions Completed</TableHead> */}
                      <TableHead>Rating</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTutors.map((tutor) => (
                      <TableRow key={tutor._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  `${BASE_URL}/uploads/${tutor.profileImage}` ||
                                  "/placeholder.svg"
                                }
                                alt={tutor.name}
                              />
                              <AvatarFallback>
                                {tutor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{tutor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {tutor.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={tutor.isActive ? "default" : "secondary"}
                            className={
                              tutor.isActive
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                          >
                            {tutor.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(tutor.createdAt), "MMMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {tutor.expertise.slice(0, 2).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {tutor.expertise.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tutor.expertise.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          {getSessionsCompletedCount(tutor._id.toString())}
                        </TableCell> */}
                        <TableCell>
                          <div className="flex items-center">
                            {tutor.averageRating > 0 ? (
                              <>
                                <span className="font-medium mr-1">
                                  {tutor.averageRating.toFixed(1)}
                                </span>
                                <span className="text-yellow-500">★</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                N/A
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleViewProfile(tutor, "tutor")
                                }
                              >
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTutor(tutor);
                                  setResetDialogOpen(true);
                                }}
                              >
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setUserToUpdate(tutor);
                                  setUserTypeToUpdate("tutor");
                                  setStatusDialogOpen(true);
                                }}
                                className={
                                  tutor.isActive
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }
                              >
                                {tutor.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Confirmation Dialog */}
      <AlertDialog
        open={confirmationDialogOpen}
        onOpenChange={setConfirmationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Account Registration</AlertDialogTitle>
            <AlertDialogDescription>
              Please review the user details before creating the account:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  First Name:
                </label>
                <p className="text-base font-medium">
                  {userToCreate?.firstName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Name:
                </label>
                <p className="text-base font-medium">
                  {userToCreate?.lastName}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Email:
              </label>
              <p className="text-base font-medium text-blue-600">
                {userToCreate?.email}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Password:
              </label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type={showGeneratedPassword ? "text" : "password"}
                  value={userToCreate?.password}
                  readOnly
                  className="flex-1 font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setShowGeneratedPassword(!showGeneratedPassword)
                  }
                >
                  {showGeneratedPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {/* <Button
                  variant="outline"
                  size="icon"
                  onClick={async () =>
                    await copyToClipboard(userToCreate?.password)
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button> */}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Account Type:{" "}
                    {userToCreate?.userType === "tutor" ? "Tutor" : "Student"}
                  </p>
                  <p className="text-blue-700">
                    This account will be created with the auto-generated
                    credentials above. The user should change their password
                    upon first login.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={addUserLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateUser}
              disabled={addUserLoading}
            >
              {addUserLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Confirm Registration"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rest of your existing dialogs remain the same */}
      {/* Tutor Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedTutor &&
                `Are you sure you want to reset password for ${selectedTutor.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetTutorPassword}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                "Confirm Reset"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Student Reset Confirmation Dialog */}
      <AlertDialog
        open={resetDialogOpenStudent}
        onOpenChange={setResetDialogOpenStudent}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Password Reset</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStudent &&
                `Are you sure you want to reset password for ${selectedStudent.email}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResettingStudent}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetStudentPassword}
              disabled={isResettingStudent}
            >
              {isResettingStudent ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                "Confirm Reset"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rest of your existing success dialogs and profile dialog remain the same */}
      {/* Tutor Password Reset Success Dialog */}
      <Dialog open={tutorSuccessDialogOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Password Reset Successful
            </DialogTitle>
            <DialogDescription>
              The password has been successfully reset for{" "}
              {selectedTutor?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                New Temporary Password:
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type={showTutorPassword ? "text" : "password"}
                  value={newTutorPassword}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowTutorPassword(!showTutorPassword)}
                >
                  {showTutorPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {/* <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => await copyToClipboard(newTutorPassword)}
                >
                  <Copy className="h-4 w-4" />
                </Button> */}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Privacy & Security Notice
                  </p>
                  <p className="text-blue-700">
                    Please share this temporary password securely with the
                    tutor. They should change it immediately upon their next
                    login for security purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleTutorSuccessClose}>Finish</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Password Reset Success Dialog */}
      <Dialog open={studentSuccessDialogOpen} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Password Reset Successful
            </DialogTitle>
            <DialogDescription>
              The password has been successfully reset for{" "}
              {selectedStudent?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                New Temporary Password:
              </label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type={showStudentPassword ? "text" : "password"}
                  value={newStudentPassword}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowStudentPassword(!showStudentPassword)}
                >
                  {showStudentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {/* <Button
                  variant="outline"
                  size="icon"
                  onClick={async () =>
                    await copyToClipboard(newStudentPassword)
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button> */}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 mb-1">
                    Privacy & Security Notice
                  </p>
                  <p className="text-blue-700">
                    Please share this temporary password securely with the
                    student. They should change it immediately upon their next
                    login for security purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleStudentSuccessClose}>Finish</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile View Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold text-[#3b2762]">
              User Profile
            </DialogTitle>
            <DialogDescription className="text-base">
              {selectedUser?.name}'s profile information
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Profile Header */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border">
              <Avatar className="h-20 w-20 border-2 border-white shadow-md">
                <AvatarImage
                  src={
                    `${BASE_URL}/uploads/${selectedUser?.profileImage}` ||
                    selectedUser?.avatar ||
                    "/placeholder.svg"
                  }
                  className="object-cover"
                />
                <AvatarFallback className="text-lg font-semibold bg-[#3b2762] text-white">
                  {selectedUser?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {selectedUser?.name}
                  </h3>
                  <Badge
                    className={`px-3 py-1 text-sm font-medium ${
                      userType === "tutor"
                        ? "bg-purple-100 text-purple-800 border-purple-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}
                  >
                    {userType === "tutor" ? "👨‍🏫 Tutor" : "👨‍🎓 Student"}
                  </Badge>
                  {userType === "tutor" && (
                    <Badge
                      className={`px-3 py-1 text-sm font-medium ${
                        selectedUser?.isReadyToTeach
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {selectedUser?.isReadyToTeach
                        ? "✅ Ready to Teach"
                        : "❌ Not Ready"}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mt-1 truncate">
                  {selectedUser?.email}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Joined{" "}
                  {selectedUser &&
                    format(new Date(selectedUser.createdAt), "MMMM d, yyyy")}
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3 pb-2 border-b">
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">
                        Member Since
                      </span>
                      <span className="text-gray-900">
                        {selectedUser &&
                          format(
                            new Date(selectedUser.createdAt),
                            "MMM d, yyyy"
                          )}
                      </span>
                    </div>
                    {userType === "tutor" && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">
                            Rating
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">
                              {selectedUser?.averageRating?.toFixed(1) || "N/A"}
                            </span>
                            {selectedUser?.averageRating && (
                              <span className="text-yellow-500">⭐</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">
                            Sessions Completed
                          </span>
                          <span className="text-gray-900 font-medium">
                            {selectedUser &&
                              getSessionsCompletedCount(selectedUser._id)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 font-medium">
                            Same-day Cancellations
                          </span>
                          <span
                            className={`font-medium ${
                              selectedUser?.onDayCancellationCount > 2
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {selectedUser?.onDayCancellationCount || 0}
                          </span>
                        </div>
                      </>
                    )}
                    {userType === "student" && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">
                          Sessions Booked
                        </span>
                        <span className="text-gray-900 font-medium">
                          {getSessionsBookedCountStudent(selectedUser._id)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tutor Expertise */}
                {userType === "tutor" &&
                  selectedUser?.expertise?.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                      <h4 className="font-semibold text-lg text-gray-900 mb-3">
                        Expertise
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.expertise.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Tutor Description */}
                {userType === "tutor" && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">
                      About
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedUser?.description || "No description provided"}
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                {userType === "tutor" && selectedUser?.contactInfo && (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h4 className="font-semibold text-lg text-gray-900 mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      {selectedUser.contactInfo.phone && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm">📞</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-900 font-medium">
                              {selectedUser.contactInfo.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedUser.contactInfo.contactEmail && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm">✉️</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Contact Email
                            </p>
                            <p className="text-gray-900 font-medium">
                              {selectedUser.contactInfo.contactEmail}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedUser.contactInfo.messenger && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm">💬</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Messenger</p>
                            <a
                              href={selectedUser.contactInfo.messenger}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3b2762] hover:text-[#2a1a4a] font-medium hover:underline transition-colors block"
                            >
                              {selectedUser.contactInfo.messenger.replace(
                                "https://m.me/",
                                "@"
                              )}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tutor Schedule */}
            {userType === "tutor" && selectedUser?.schedule && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-lg text-gray-900">
                    Teaching Schedule
                  </h4>
                  <Badge variant="outline" className="text-sm">
                    Total Slots:{" "}
                    {Object.values(selectedUser.schedule).flat().length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(selectedUser.schedule).map(
                    ([day, timeSlots]) => (
                      <div
                        key={day}
                        className="border rounded-lg p-3 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 capitalize">
                            {day}
                          </h5>
                          <Badge variant="secondary" className="text-xs">
                            {timeSlots.length} slots
                          </Badge>
                        </div>
                        {timeSlots.length > 0 ? (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {timeSlots.map((time, index) => (
                              <div
                                key={index}
                                className="text-sm text-gray-700 bg-white px-2 py-1 rounded border"
                              >
                                {time}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No available slots
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Student Sessions Tabs */}
            {userType === "student" && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h4 className="font-semibold text-lg text-gray-900 mb-4">
                  Session History
                </h4>
                <Tabs defaultValue="upcoming" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger
                      value="upcoming"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                    >
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger
                      value="completed"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                    >
                      Completed
                    </TabsTrigger>
                    <TabsTrigger
                      value="cancelled"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                    >
                      Cancelled
                    </TabsTrigger>
                    <TabsTrigger
                      value="request"
                      className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
                    >
                      Requests
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4 min-h-[60px] flex items-center justify-center">
                    <TabsContent
                      value="upcoming"
                      className="m-0 w-full text-center"
                    >
                      <p className="text-2xl font-bold text-[#3b2762]">
                        {getSessionsConfirmedCountStudent(selectedUser._id)}
                      </p>
                      <p className="text-gray-600 text-sm">Upcoming Sessions</p>
                    </TabsContent>
                    <TabsContent
                      value="completed"
                      className="m-0 w-full text-center"
                    >
                      <p className="text-2xl font-bold text-green-600">
                        {getSessionsCompletedCountStudent(selectedUser._id)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Completed Sessions
                      </p>
                    </TabsContent>
                    <TabsContent
                      value="cancelled"
                      className="m-0 w-full text-center"
                    >
                      <p className="text-2xl font-bold text-red-600">
                        {getSessionsCancelledExpiredCountStudent(
                          selectedUser._id
                        )}
                      </p>
                      <p className="text-gray-600 text-sm">Cancelled/Expired</p>
                    </TabsContent>
                    <TabsContent
                      value="request"
                      className="m-0 w-full text-center"
                    >
                      <p className="text-2xl font-bold text-amber-600">
                        {getPendingRequestsCountStudent(selectedUser._id)}
                      </p>
                      <p className="text-gray-600 text-sm">Pending Requests</p>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Activate/Deactivate Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToUpdate?.isActive ? "Deactivate User" : "Activate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToUpdate && (
                <>
                  Are you sure you want to{" "}
                  {userToUpdate.isActive ? "deactivate" : "activate"}{" "}
                  <strong>{userToUpdate.name}</strong> ({userToUpdate.email})?
                  {userToUpdate.isActive && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-amber-800 text-sm">
                        ⚠️ Deactivated users won't be able to log in or access
                        the system.
                      </p>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              disabled={isUpdatingStatus}
              className={
                userToUpdate?.isActive
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {isUpdatingStatus ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                `${userToUpdate?.isActive ? "Deactivate" : "Activate"} User`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManageUsers;

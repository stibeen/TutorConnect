import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CalendarPlus,
  Clock,
  Users,
  Save,
  Plus,
  X,
  Calendar,
  Ban,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { convert24to12 } from "../../utils/timeUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ManageSchedule() {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groupSessions, setGroupSessions] = useState([]);
  const [newGroupSession, setNewGroupSession] = useState({
    date: "",
    time: "",
    topic: "",
    modality: "online",
    specificTopic: "", // ADD THIS LINE
    meetingLink: "",
    locationDetails: "", // ADD THIS LINE
    specialInstructions: "", // ADD THIS LINE
  });
  const [sessionToCancel, setSessionToCancel] = useState(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonError, setCancelReasonError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for save confirmation dialog
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [pricing, setPricing] = useState({
    groupSessionPrice: 15.0,
    currency: "PHP",
  });
  // Add these states with your existing states
  const [isCreateConfirmDialogOpen, setIsCreateConfirmDialogOpen] =
    useState(false);
  const [creatingSession, setCreatingSession] = useState(false);

  const { user } = useAuth();

  // Add this useEffect to fetch pricing
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/pricing`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // If authentication required
          },
        });
        setPricing(response.data);
      } catch (error) {
        console.error("Failed to fetch pricing:", error);
        // Fallback to default prices
        setPricing({
          groupSessionPrice: 15.0,
          currency: "PHP",
        });
      }
    };
    fetchPricing();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tutor data
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

        // Fetch existing group sessions
        const groupSessionsResponse = await axios.get(
          `${BASE_URL}/api/group-sessions/tutor/${user.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setGroupSessions(groupSessionsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // Open save confirmation dialog
  const handleSaveConfirmation = () => {
    setIsSaveDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    setIsSaveDialogOpen(false);
    setSaving(true);
    try {
      await axios.put(
        `${BASE_URL}/api/tutors/${user.id}/schedule`,
        { schedule: tutor.schedule },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Schedule saved successfully!");
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmCreateGroupSession = async () => {
    // if (
    //   !newGroupSession.date ||
    //   !newGroupSession.time ||
    //   !newGroupSession.topic ||
    //   !newGroupSession.specificTopic.trim() // ADD THIS VALIDATION
    // ) {
    //   toast.error("Please fill in all required fields");
    //   return;
    // }

    // // Validate that the date is at least 24 hours ahead
    // if (!isDateValid(newGroupSession.date)) {
    //   toast.error(
    //     "Group sessions must be scheduled at least 24 hours in advance"
    //   );
    //   return;
    // }

    // // Add validation for meeting link if modality is online
    // if (newGroupSession.modality === "online" && !newGroupSession.meetingLink) {
    //   toast.error("Please provide a meeting link for online sessions");
    //   return;
    // }

    // // Google Meet URL pattern validation
    // const isValidGoogleMeetLink = (link) => {
    //   const regex =
    //     /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\/)?(\?.*)?$/i;
    //   return regex.test(link);
    // };

    // if (newGroupSession.modality === "online") {
    //   if (!isValidGoogleMeetLink(newGroupSession.meetingLink.trim())) {
    //     toast.error(
    //       "Invalid Google Meet link. Format: https://meet.google.com/xxx-xxxx-xxx"
    //     );
    //     return;
    //   }
    // }

    try {
      // Convert 12-hour time to 24-hour format for backend
      const time24Hour = convertTo24Hour(newGroupSession.time);

      // Combine main topic with specific topic
      const fullTopic = `${
        newGroupSession.topic
      } - ${newGroupSession.specificTopic.trim()}`; // ADD THIS LINE

      const response = await axios.post(
        `${BASE_URL}/api/group-sessions`,
        {
          date: newGroupSession.date, // Send as Date object
          startTime: time24Hour, // Send in 24-hour format
          endTime: calculateEndTime(time24Hour), // Calculate end time
          topic: fullTopic,
          modality: newGroupSession.modality,
          tutorId: user.id,
          maxParticipants: 5,
          price: pricing.groupSessionPrice,
          status: "open", // Set status to 'open'
          meetingLink:
            newGroupSession.modality === "online"
              ? newGroupSession.meetingLink
              : "",
          locationDetails:
            newGroupSession.modality === "face-to-face"
              ? newGroupSession.locationDetails.trim()
              : "", // ADD THIS LINE
          specialInstructions:
            newGroupSession.modality === "face-to-face"
              ? newGroupSession.specialInstructions.trim()
              : "", // ADD THIS LINE
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setGroupSessions([...groupSessions, response.data]);
      setNewGroupSession({
        date: "",
        time: "",
        topic: "",
        specificTopic: "", // RESET SPECIFIC TOPIC
        modality: "online",
        meetingLink: "", // Reset meeting link
        locationDetails: "", // RESET THIS FIELD
        specialInstructions: "", // RESET THIS FIELD
      });
      toast.success("Group session created successfully!");
      setIsCreateConfirmDialogOpen(false);
    } catch (error) {
      console.error("Failed to create group session:", error);

      // Extract the error message from the backend response
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create group session";

      toast.error(errorMessage);
    } finally {
      setCreatingSession(false);
    }
  };

  // Replace the existing handleAddGroupSession function with these:
  const handleCreateGroupSession = () => {
    // Validate required fields first
    if (
      !newGroupSession.date ||
      !newGroupSession.time ||
      !newGroupSession.topic ||
      !newGroupSession.specificTopic.trim() ||
      (newGroupSession.modality === "online" && !newGroupSession.meetingLink) ||
      !isDateValid(newGroupSession.date)
    ) {
      toast.error(
        "Please fill in all required fields and ensure the date is valid"
      );
      return;
    }

    // Validate that the date is at least 24 hours ahead
    if (!isDateValid(newGroupSession.date)) {
      toast.error(
        "Group sessions must be scheduled at least 24 hours in advance"
      );
      return;
    }

    // Add validation for meeting link if modality is online
    if (newGroupSession.modality === "online" && !newGroupSession.meetingLink) {
      toast.error("Please provide a meeting link for online sessions");
      return;
    }

    // Google Meet URL pattern validation
    const isValidGoogleMeetLink = (link) => {
      const regex =
        /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\/)?(\?.*)?$/i;
      return regex.test(link);
    };

    if (newGroupSession.modality === "online") {
      if (!isValidGoogleMeetLink(newGroupSession.meetingLink.trim())) {
        toast.error(
          "Invalid Google Meet link. Format: https://meet.google.com/xxx-xxxx-xxx"
        );
        return;
      }
    }

    // Open confirmation dialog
    setIsCreateConfirmDialogOpen(true);
  };

  // Helper functions
  function convertTo24Hour(time12h) {
    const [time, period] = time12h.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  function calculateEndTime(startTime) {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = (hours + 1) % 24;
    return `${endHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // Validation for cancellation reason
  const validateCancelReason = (reason) => {
    if (!reason || reason.trim() === "") {
      return "Cancellation reason is required";
    }

    if (reason.trim().length < 10) {
      return "Cancellation reason must be at least 10 characters long";
    }

    if (reason.trim().length > 500) {
      return "Cancellation reason cannot exceed 500 characters";
    }

    // Check for meaningful content (not just spaces or repetitive characters)
    const meaningfulContent = reason.trim().replace(/\s+/g, " ");
    if (meaningfulContent.length < 10) {
      return "Please provide a more detailed cancellation reason";
    }

    return "";
  };

  const handleCancelReasonChange = (value) => {
    setCancelReason(value);
    const error = validateCancelReason(value);
    setCancelReasonError(error);
  };

  const handleCancelGroupSession = async () => {
    const error = validateCancelReason(cancelReason);
    if (error) {
      setCancelReasonError(error);
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.patch(
        `${BASE_URL}/api/group-sessions/${sessionToCancel._id}/cancel-by-tutor`,
        { reason: cancelReason.trim() },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the local state to reflect the cancellation
      setGroupSessions(
        groupSessions.map((session) =>
          session._id === sessionToCancel._id
            ? {
                ...session,
                status: "cancelled",
                cancellationReason: cancelReason.trim(),
              }
            : session
        )
      );

      toast.success("Group session cancelled successfully!");
      setIsCancelDialogOpen(false);
      setCancelReason("");
      setCancelReasonError("");
      setSessionToCancel(null);
    } catch (error) {
      console.error("Failed to cancel group session:", error);
      toast.error("Failed to cancel group session");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCancelDialog = (session) => {
    // Don't allow cancelling already cancelled or completed sessions
    if (session.status === "cancelled" || session.status === "completed") {
      toast.error(`Cannot cancel a session that is already ${session.status}`);
      return;
    }

    // Check if session has already started
    const sessionDate = new Date(session.date);
    const [hours, minutes] = session.startTime.split(":").map(Number);
    sessionDate.setHours(hours, minutes, 0, 0);

    if (new Date() >= sessionDate) {
      toast.error("Cannot cancel a group session that has already started");
      return;
    }

    setSessionToCancel(session);
    setCancelReason("");
    setCancelReasonError("");
    setIsCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setIsCancelDialogOpen(false);
    setCancelReason("");
    setCancelReasonError("");
    setSessionToCancel(null);
  };

  const handleTimeSlotToggle = (day, time) => {
    setTutor((prevTutor) => {
      const newSchedule = { ...prevTutor.schedule };
      const daySchedule = newSchedule[day] || [];

      if (daySchedule.includes(time)) {
        newSchedule[day] = daySchedule.filter((t) => t !== time);
      } else {
        newSchedule[day] = [...daySchedule, time].sort((a, b) => {
          const convertToMinutes = (timeStr) => {
            const [timePart, period] = timeStr.split(" ");
            const [hours, minutes] = timePart.split(":").map(Number);
            let totalMinutes = (hours % 12) * 60 + minutes;
            if (period === "PM") totalMinutes += 12 * 60;
            return totalMinutes;
          };
          return convertToMinutes(a) - convertToMinutes(b);
        });
      }

      return { ...prevTutor, schedule: newSchedule };
    });
  };

  // Add this function to get available time slots for the selected date
  const getAvailableTimeSlots = (selectedDate) => {
    if (!selectedDate || !tutor) return [];

    const date = new Date(selectedDate);
    const dayOfWeek = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Sunday being 0

    // Get the tutor's available time slots for that day
    const availableSlots = tutor.schedule[dayOfWeek] || [];

    return availableSlots.sort((a, b) => {
      const convertToMinutes = (timeStr) => {
        const [timePart, period] = timeStr.split(" ");
        const [hours, minutes] = timePart.split(":").map(Number);
        let totalMinutes = (hours % 12) * 60 + minutes;
        if (period === "PM") totalMinutes += 12 * 60;
        return totalMinutes;
      };
      return convertToMinutes(a) - convertToMinutes(b);
    });
  };

  // Add this function to calculate the minimum allowed date (24 hours from now)
  const getMinDate = () => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Add 24 hours
    return minDate.toISOString().split("T")[0];
  };

  // Add this function to check if a date is valid (at least 24 hours ahead)
  const isDateValid = (selectedDate) => {
    if (!selectedDate) return true;

    const selected = new Date(selectedDate);
    const now = new Date();
    const timeDifference = selected.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    return hoursDifference >= 24;
  };

  // Enhanced version with detailed validation
  const validateDate = (selectedDate) => {
    if (!selectedDate) return { isValid: true, message: "" };

    const selected = new Date(selectedDate);
    const now = new Date();
    const timeDifference = selected.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 0) {
      return { isValid: false, message: "Cannot select past dates" };
    } else if (hoursDifference < 24) {
      return {
        isValid: false,
        // message: `Selected date is only ${Math.ceil(
        //   hoursDifference
        // )} hours away. Minimum 24 hours required.`,
        message: `Initiating a group-session within 24 hours is not allowed.`
      };
    } else {
      return { isValid: true, message: "" };
    }
  };

  // Add this function with your other helper functions
  const getCurrencySymbol = () => {
    switch (pricing.currency) {
      case "PHP":
        return "₱";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      default:
        return "₱";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  if (!tutor) return <div>Error loading tutor data</div>;

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = [
    "7:30 AM",
    "8:30 AM",
    "9:30 AM",
    "10:30 AM",
    "11:30 AM",
    "12:30 PM",
    "1:30 PM",
    "2:30 PM",
    "3:30 PM",
    "4:30 PM",
    "5:30 PM",
  ]; // kani dapat dinani static puhon si admin dapat magbuot unsa na mga timeslots naa ani, as well as the daysOfWeek

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Tabs defaultValue="availability">
        <TabsList className="grid w-full grid-cols-2 border-1 border-[#3b2762]">
          <TabsTrigger value="availability">
            <Calendar className="mr-2 h-4 w-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="group-sessions">
            <Users className="mr-2 h-4 w-4" />
            Group Sessions
          </TabsTrigger>
        </TabsList>

        {/* Availability Tab */}
        <TabsContent value="availability" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Availability</CardTitle>
              <CardDescription>
                Select the time slots when you're available for tutoring
                sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="space-y-2">
                      <h3 className="font-semibold text-sm">{day}</h3>
                      <div className="space-y-1">
                        {timeSlots.map((time) => {
                          const isSelected =
                            tutor.schedule[day]?.includes(time);
                          return (
                            <Button
                              key={time}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                              onClick={() => handleTimeSlotToggle(day, time)}
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Schedule Button with Confirmation Dialog */}
                <AlertDialog
                  open={isSaveDialogOpen}
                  onOpenChange={setIsSaveDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      onClick={handleSaveConfirmation}
                      disabled={saving}
                      className="w-full md:w-auto"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save Schedule"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirm Schedule Changes
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to save these changes to your
                        schedule? This will update your availability for all
                        future tutoring sessions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={saving}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSaveSchedule}
                        disabled={saving}
                        className="bg-[#3b2762] hover:bg-[#2d1f4a]"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group Sessions Tab */}
        <TabsContent value="group-sessions" className="mt-4">
          <div className="grid gap-6">
            {/* Create New Group Session */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Group Session</CardTitle>
                <CardDescription>
                  Set up group sessions for specific dates that students can
                  join (max 5 students at ₱{pricing.groupSessionPrice} each)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        type="date"
                        value={newGroupSession.date}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const validation = validateDate(selectedDate);

                          if (!validation.isValid) {
                            toast.error(validation.message);
                            return;
                          }

                          setNewGroupSession({
                            ...newGroupSession,
                            date: selectedDate,
                            time: "",
                          });
                        }}
                        min={getMinDate()}
                      />
                      <p className="text-xs text-muted-foreground">
                        Group sessions must be scheduled at least 24 hours in
                        advance to allow for preparation time
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Time *</Label>
                      <Select
                        value={newGroupSession.time}
                        onValueChange={(value) =>
                          setNewGroupSession({
                            ...newGroupSession,
                            time: value,
                          })
                        }
                        disabled={!newGroupSession.date} // Disable if no date selected
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              newGroupSession.date
                                ? "Select time"
                                : "Select date first"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableTimeSlots(newGroupSession.date).map(
                            (time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            )
                          )}
                          {getAvailableTimeSlots(newGroupSession.date)
                            .length === 0 &&
                            newGroupSession.date && (
                              <SelectItem value="none" disabled>
                                No available time slots for this day
                              </SelectItem>
                            )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic *</Label>
                    <Select
                      value={newGroupSession.topic}
                      onValueChange={(value) =>
                        setNewGroupSession({ ...newGroupSession, topic: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {tutor.expertise.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Specific Topic Input */}
                  <div className="space-y-2">
                    <Label htmlFor="specific-topic">
                      Specific Topic to Tackle *
                    </Label>
                    <Input
                      id="specific-topic"
                      type="text"
                      placeholder="e.g., variable declaration and calling, loops and arrays, inheritance, etc."
                      value={newGroupSession.specificTopic}
                      onChange={(e) =>
                        setNewGroupSession({
                          ...newGroupSession,
                          specificTopic: e.target.value,
                        })
                      }
                      disabled={!newGroupSession.topic} // Disable if no main topic selected
                    />
                    <p className="text-xs text-muted-foreground">
                      Specify the particular concepts or areas to focus on
                      during the 1-hour session
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modality">Modality *</Label>
                    <Select
                      value={newGroupSession.modality}
                      onValueChange={(value) =>
                        setNewGroupSession({
                          ...newGroupSession,
                          modality: value,
                          meetingLink:
                            value === "face-to-face"
                              ? ""
                              : newGroupSession.meetingLink, // Clear meeting link if switching to face-to-face
                          locationDetails:
                            value === "online"
                              ? ""
                              : newGroupSession.locationDetails, // Clear location when switching to online
                          specialInstructions:
                            value === "online"
                              ? ""
                              : newGroupSession.specialInstructions, // Clear instructions when switching to online
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select modality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="face-to-face">
                          Face-to-Face
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add Meeting Link Field - Only show for online modality */}
                  {newGroupSession.modality === "online" && (
                    <div className="space-y-2">
                      <Label htmlFor="meetingLink">Meeting Link *</Label>
                      <Input
                        type="url"
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                        value={newGroupSession.meetingLink}
                        onChange={(e) =>
                          setNewGroupSession({
                            ...newGroupSession,
                            meetingLink: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Location Details Field - Only show for face-to-face modality */}
                  {newGroupSession.modality === "face-to-face" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="locationDetails">
                          Location Details *
                        </Label>
                        <Input
                          id="locationDetails"
                          type="text"
                          placeholder="e.g., Room 201, Main Library, 2nd Floor"
                          value={newGroupSession.locationDetails}
                          onChange={(e) =>
                            setNewGroupSession({
                              ...newGroupSession,
                              locationDetails: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          Provide specific details about where the session will
                          take place
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialInstructions">
                          Special Instructions (Optional)
                        </Label>
                        <Textarea
                          id="specialInstructions"
                          placeholder="e.g., Bring your own laptop, meet at the front desk, parking information, etc."
                          value={newGroupSession.specialInstructions}
                          onChange={(e) =>
                            setNewGroupSession({
                              ...newGroupSession,
                              specialInstructions: e.target.value,
                            })
                          }
                          className="min-h-[80px]"
                        />
                        <p className="text-xs text-muted-foreground">
                          Any additional instructions for students attending the
                          face-to-face session
                        </p>
                      </div>
                    </>
                  )}

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Group Session Details:</strong>
                      <br />
                      • Maximum participants: 5 students
                      <br />• Price per student: ₱{pricing.groupSessionPrice}
                      <br />• Duration: 60 minutes
                      {newGroupSession.modality === "online" && (
                        <>
                          <br />• Meeting link required for online sessions
                        </>
                      )}
                      {newGroupSession.modality === "face-to-face" && (
                        <>
                          <br />• Location details required for face-to-face
                          sessions
                        </>
                      )}
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateGroupSession}
                    className="w-full"
                    disabled={
                      !newGroupSession.date ||
                      !newGroupSession.time ||
                      !newGroupSession.topic ||
                      !newGroupSession.specificTopic.trim() || // ADD THIS CONDITION
                      (newGroupSession.modality === "online" &&
                        !newGroupSession.meetingLink) ||
                      (newGroupSession.modality === "face-to-face" &&
                        !newGroupSession.locationDetails.trim()) || // ADD THIS CONDITION
                      !isDateValid(newGroupSession.date) // Add this condition
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Group Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Create Group Session Confirmation Dialog - TABS VERSION*/}
            <AlertDialog
              open={isCreateConfirmDialogOpen}
              onOpenChange={setIsCreateConfirmDialogOpen}
            >
              <AlertDialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Group Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Review session details before creating
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details" className="text-xs">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="text-xs">
                      Pricing
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs">
                      Notes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Date:</span>
                        <span>
                          {newGroupSession.date
                            ? new Date(newGroupSession.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "Not set"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Time:</span>
                        <span>{newGroupSession.time || "Not set"}</span>
                      </div>
                      <div>
                        <span className="font-medium">Topic:</span>
                        <p className="text-xs mt-1">
                          {newGroupSession.topic
                            ? tutor.expertise.find(
                                (t) => t === newGroupSession.topic
                              )
                            : "Not set"}
                          {newGroupSession.specificTopic &&
                            ` - ${newGroupSession.specificTopic}`}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Modality:</span>
                        <span>
                          {newGroupSession.modality === "online"
                            ? "Online"
                            : "Face-to-Face"}
                        </span>
                      </div>
                      {newGroupSession.modality === "online" && (
                        <div>
                          <span className="font-medium">Meeting Link:</span>
                          <p className="text-xs break-words mt-1">
                            {newGroupSession.meetingLink || "Not set"}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Price per student:</span>
                        <span className="font-medium">
                          {getCurrencySymbol()}
                          {pricing.groupSessionPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum participants:</span>
                        <span>5 students</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Potential total:</span>
                        <span>
                          {getCurrencySymbol()}
                          {(pricing.groupSessionPrice * 5).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div className="flex items-start gap-2">
                        <Ban className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Cannot cancel within 24 hours of session</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Responsible for conducting the session</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Students can join until 5 spots are filled</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel
                    onClick={() => setIsCreateConfirmDialogOpen(false)}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmCreateGroupSession}
                    disabled={creatingSession}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {creatingSession ? "Creating..." : "Confirm Create"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Existing Group Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Group Sessions</CardTitle>
                <CardDescription>
                  Manage your existing group sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groupSessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No group sessions created yet
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {groupSessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{session.topic}</h4>
                            {session.status === "cancelled" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Cancelled
                              </span>
                            )}
                            {session.status === "completed" && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}{" "}
                            at {convert24to12(session.startTime)} •{" "}
                            {session.modality} • {session.currentParticipants}/5
                            participants • ₱15.00 per student
                            {session.modality === "online" &&
                              session.meetingLink && (
                                <>
                                  <br />
                                  <span className="text-blue-600">
                                    Meeting Link: {session.meetingLink}
                                  </span>
                                </>
                              )}
                            {session.modality === "face-to-face" &&
                              session.locationDetails && (
                                <>
                                  <br />
                                  <span className="text-green-600">
                                    Location: {session.locationDetails}
                                  </span>
                                </>
                              )}
                            {session.modality === "face-to-face" &&
                              session.specialInstructions && (
                                <>
                                  <br />
                                  <span className="text-purple-600">
                                    Instructions: {session.specialInstructions}
                                  </span>
                                </>
                              )}
                            {session.cancellationReason && (
                              <>
                                <br />
                                <span className="text-red-600">
                                  Cancellation Reason:{" "}
                                  {session.cancellationReason}
                                </span>
                              </>
                            )}
                          </p>
                        </div>

                        {session.status !== "cancelled" &&
                          session.status !== "completed" && (
                            <AlertDialog
                              open={
                                isCancelDialogOpen &&
                                sessionToCancel?._id === session._id
                              }
                              onOpenChange={setIsCancelDialogOpen}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openCancelDialog(session)}
                                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel Group Session
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Please provide a reason for cancelling this
                                    group session:
                                    <br />
                                    <br />
                                    <strong>Topic:</strong>{" "}
                                    {sessionToCancel?.topic}
                                    <br />
                                    <strong>Date:</strong>{" "}
                                    {sessionToCancel?.date
                                      ? new Date(
                                          sessionToCancel.date
                                        ).toLocaleDateString("en-US", {
                                          weekday: "long",
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        })
                                      : ""}
                                    <br />
                                    <strong>Time:</strong>{" "}
                                    {convert24to12(sessionToCancel?.startTime)}
                                    <br />
                                    <strong>Modality:</strong>{" "}
                                    {sessionToCancel?.modality}
                                    <br />
                                    <strong>Participants:</strong>{" "}
                                    {sessionToCancel?.currentParticipants}/5
                                    <div className="mt-4 space-y-2">
                                      <Label
                                        htmlFor="cancel-reason"
                                        className="flex items-center gap-1"
                                      >
                                        Cancellation Reason *
                                        <span className="text-xs text-muted-foreground">
                                          (10-500 characters)
                                        </span>
                                      </Label>
                                      <Textarea
                                        id="cancel-reason"
                                        placeholder="Please provide a detailed explanation for cancelling this session (minimum 10 characters)..."
                                        value={cancelReason}
                                        onChange={(e) =>
                                          handleCancelReasonChange(
                                            e.target.value
                                          )
                                        }
                                        className={`min-h-[100px] ${
                                          cancelReasonError
                                            ? "border-red-500 focus:border-red-500"
                                            : ""
                                        }`}
                                      />
                                      {cancelReasonError && (
                                        <div className="flex items-center gap-1 text-red-600 text-sm">
                                          <AlertCircle className="h-4 w-4" />
                                          {cancelReasonError}
                                        </div>
                                      )}
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>
                                          {cancelReason.trim().length}/500
                                          characters
                                        </span>
                                        <span>
                                          Minimum 10 characters required
                                        </span>
                                      </div>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={handleCancelDialogClose}
                                  >
                                    Keep Session
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleCancelGroupSession}
                                    disabled={
                                      !!cancelReasonError ||
                                      !cancelReason.trim() ||
                                      isSubmitting
                                    }
                                    className="bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    {isSubmitting
                                      ? "Cancelling..."
                                      : "Cancel Session"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

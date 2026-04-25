import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  CalendarClock,
  Check,
  MessageSquare,
  Video,
  X,
  MoreHorizontal,
  Loader,
  Star,
  RotateCw,
  Info,
  Users,
  BookOpen,
  MapPin,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";
import { convert24to12 } from "../../utils/timeUtils";
import toast from "react-hot-toast";
import axios from "axios";
import {
  format,
  parse,
  isBefore,
  isAfter,
  addMinutes,
  isToday,
  isTomorrow,
} from "date-fns";
import { CustomTooltip } from "../CustomTooltip";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
// TO THE FUTURE PROGRAMMER THAT WILL HANDLE THIS PROJECT:I APOLOGIZE. GOOD LUCK

// FIXED: Create a separate component for completed session items to use hooks properly
const CompletedSessionItem = ({
  booking,
  fetchGroupSessionReviews,
  groupSessionReviews,
  loadingReviews,
  handleViewParticipants,
}) => {
  const isGroupSession = booking.sessionType === "group";
  const participantCount = isGroupSession
    ? booking.participants?.length || 0
    : 0;

  // Proper useEffect with correct dependencies
  useEffect(() => {
    if (isGroupSession && booking._id && !groupSessionReviews[booking._id]) {
      fetchGroupSessionReviews(booking._id);
    }
  }, [
    isGroupSession,
    booking._id,
    groupSessionReviews,
    fetchGroupSessionReviews,
  ]);
  // Now it's safe to include groupSessionReviews because we have a condition

  const groupReviews = groupSessionReviews[booking._id];

  return (
    <div key={booking._id} className="rounded-lg border">
      <div className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {isGroupSession ? (
              <CustomTooltip
                content={
                  participantCount
                    ? "Click to view participants"
                    : "No participants yet"
                }
                position="right"
              >
                <div
                  className="h-10 w-10 rounded-full bg-[#3b2762] flex items-center justify-center cursor-pointer"
                  onClick={() => handleViewParticipants(booking)}
                >
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CustomTooltip>
            ) : (
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    `${BASE_URL}/uploads/${booking.student?.profileImage}` ||
                    "/placeholder.svg?height=40&width=40"
                  }
                  alt={booking.student?.name || "Student"}
                />
                <AvatarFallback>
                  {booking.student?.name
                    ? booking.student.name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                    : "ST"}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="font-medium">
                {booking.topic} with{" "}
                {isGroupSession ? "Group" : booking.student?.name || "Student"}{" "}
                {isGroupSession && "(Group Session)"}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarClock className="h-3 w-3" />
                <span>
                  {booking.formattedDate}, {convert24to12(booking.startTime)} -{" "}
                  {convert24to12(booking.endTime)}
                </span>
              </div>

              {/* Group Session Review Summary */}
              {isGroupSession && groupReviews && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-[#efc940] fill-[#efc940]" />
                    <span className="text-xs font-medium">
                      {groupReviews.averageRating?.toFixed(1) || "0.0"}/5
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({groupReviews.totalReviews} review
                    {groupReviews.totalReviews !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Group Session Reviews Button */}
            {isGroupSession && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchGroupSessionReviews(booking._id)}
                    disabled={loadingReviews[booking._id]}
                  >
                    {loadingReviews[booking._id] ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Star className="mr-2 h-3 w-3 text-[#efc940]" />
                        Session Reviews
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Group Session Reviews</DialogTitle>
                    <DialogDescription>
                      All student reviews for "{booking.topic}" on{" "}
                      {booking.formattedDate}
                    </DialogDescription>
                  </DialogHeader>

                  {groupReviews ? (
                    <div className="space-y-4">
                      {/* Overall Stats */}
                      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#3b2762]">
                            {groupReviews.averageRating?.toFixed(1) || "0.0"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Average Rating
                          </div>
                          <div className="flex justify-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <=
                                  Math.round(groupReviews.averageRating || 0)
                                    ? "text-[#efc940] fill-[#efc940]"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#3b2762]">
                            {groupReviews.totalReviews}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Total Reviews
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {participantCount} participants total
                          </div>
                        </div>
                      </div>

                      {/* Individual Reviews */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">
                          Individual Reviews:
                        </h4>
                        {groupReviews.individualReviews?.length > 0 ? (
                          groupReviews.individualReviews.map(
                            (review, index) => (
                              <div
                                key={index}
                                className="p-3 border rounded-lg"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={
                                          review.student?.avatar ||
                                          "/placeholder.svg"
                                        }
                                        alt={review.student?.name}
                                      />
                                      <AvatarFallback>
                                        {review.student?.name
                                          ? review.student.name
                                              .split(" ")
                                              .map((word) => word[0])
                                              .join("")
                                              .toUpperCase()
                                          : "S"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {review.student?.name || "Student"}
                                      </p>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`h-3 w-3 ${
                                              star <= review.rating
                                                ? "text-[#efc940] fill-[#efc940]"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(review.reviewedAt),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                </div>
                                {review.comment && (
                                  <p className="text-sm mt-2 text-muted-foreground">
                                    "{review.comment}"
                                  </p>
                                )}
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No reviews yet for this group session
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center py-8">
                      <Loader className="h-8 w-8 animate-spin" />
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between p-4">
        <div className="text-sm">
          <span className="font-medium">Session format:</span>{" "}
          {booking.modality === "online" ? "Online Meeting" : "Face-to-Face"}
          {booking.modality === "face-to-face" && booking.locationDetails && (
            <span>: {booking.locationDetails}</span>
          )}
          {isGroupSession && (
            <div className="mt-1 text-xs text-muted-foreground">
              {participantCount} participant
              {participantCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {booking.review?.rating ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#3b2762] text-[#3b2762] hover:bg-[#f5f1ff]"
                >
                  <Star className="mr-2 h-3 w-3 text-[#efc940]" />
                  {isGroupSession ? "View Student's Review" : "View Review"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {isGroupSession
                      ? `Review from ${
                          booking.student?.name || "Student"
                        } (Group Session)`
                      : "Student Review"}
                  </DialogTitle>
                  <DialogDescription>
                    {isGroupSession
                      ? `Feedback for the group session on ${booking.topic}`
                      : `Feedback from ${
                          booking.student?.name || "the student"
                        }`}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label className="block mb-2">
                      {isGroupSession ? "Student's Rating" : "Rating"}
                    </Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${
                            star <= booking.review.rating
                              ? "text-[#efc940] fill-[#efc940]"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {booking.review.comment && (
                    <div>
                      <Label className="block mb-2">
                        {isGroupSession ? "Student's Comments" : "Comments"}
                      </Label>
                      <div className="p-3 border rounded-md bg-gray-50">
                        {booking.review.comment}
                      </div>
                    </div>
                  )}
                  {isGroupSession && (
                    <div className="text-xs text-muted-foreground">
                      This is an individual student's perspective on the group
                      session.
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            !isGroupSession && (
              <CustomTooltip
                content={
                  isGroupSession
                    ? "Waiting for students' reviews"
                    : "Pending student's review"
                }
                position="left"
              >
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Tooltip</span>
                </Button>
              </CustomTooltip>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export function TutorSessionsList({ status, bookings: initialBookings }) {
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [localBookings, setLocalBookings] = useState(initialBookings);
  const [declineReason, setDeclineReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);

  const [meetingLink, setMeetingLink] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [currentInstructions, setCurrentInstructions] = useState("");
  const [currentLocationDetails, setCurrentLocationDetails] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [proofImage, setProofImage] = useState(null);
  const [completingBookingId, setCompletingBookingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [otherOptionDialogOpen, setOtherOptionDialogOpen] = useState(false);
  const [noShowOption, setNoShowOption] = useState("");
  const [noShowReason, setNoShowReason] = useState("");

  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState([]);

  const [groupBookings, setGroupBookings] = useState([]);

  // Add this state and function to your TutorSessionsList component
  const [groupSessionReviews, setGroupSessionReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});
  const [sessionToCancel, setSessionToCancel] = useState(null);

  // Add filter state
  const [dateFilter, setDateFilter] = useState("all"); // "all", "today", "tomorrow"
  const [
    withIn24hrsNoticeCancelDialogOpen,
    setWithIn24hrsNoticeCancelDialogOpen,
  ] = useState(false);
  
  // Fix: Remove duplicate isMounted declaration and fix useEffect dependency
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
      if (user?.id && isMounted) {
        fetchAllBookings();
      }
    }, pollingInterval);

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [status, user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchGroupBookings();
    }
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const toastId = toast.loading("Refreshing bookings...");

    try {
      // Fetch both regular bookings and group bookings in parallel
      await Promise.all([fetchBookings(), fetchGroupBookings()]);

      toast.success("Bookings updated successfully", { id: toastId });
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh some bookings", { id: toastId });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/bookings/my-bookings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      setLocalBookings(response.data);
      console.log("Local Bookings:", localBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error; // Re-throw to handle in handleRefresh
    }
  };

  const fetchGroupBookings = async () => {
    try {
      console.log("Fetching group bookings for user:", user?.id);

      const response = await axios.get(
        `${BASE_URL}/api/group-sessions/tutor/${user.id}`,
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

  // Add another useEffect to log when groupBookings actually updates
  useEffect(() => {
    console.log("Group bookings updated:", groupBookings);
  }, [groupBookings]);

  // Updated fetchGroupSessionReviews function
  const fetchGroupSessionReviews = async (groupId) => {
    // Remove the early return check here
    setLoadingReviews((prev) => ({ ...prev, [groupId]: true }));

    try {
      const response = await axios.get(
        `${BASE_URL}/api/bookings/group-session/${groupId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setGroupSessionReviews((prev) => ({
        ...prev,
        [groupId]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching group session reviews:", error);
      toast.error("Failed to load session reviews");
    } finally {
      setLoadingReviews((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const handleDecline = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    if (!declineReason.trim()) {
      toast.error("Please provide a reason for declining");
      return;
    }

    setIsDeclining(true);
    const toastId = toast.loading("Declining booking...");

    // Store the original bookings for rollback
    const originalBookings = [...localBookings];

    try {
      // 1. Immediately update UI
      setLocalBookings((prev) =>
        prev.filter((booking) => booking._id !== currentBookingId)
      );

      const response = await axios.patch(
        `${BASE_URL}/api/bookings/${currentBookingId}/cancel`,
        { reason: declineReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Booking declined successfully", { id: toastId });
      setDeclineDialogOpen(false);
      setDeclineReason("");
    } catch (error) {
      // Error - rollback UI
      setLocalBookings(originalBookings);
      console.error("Full error object:", error);

      const errorMessage =
        error.response?.data?.error || "Failed to decline booking";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsDeclining(false);
      setDeclineDialogOpen(false);
      setDeclineReason("");
    }
  };

  const handleConfirm = async (bookingId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    const booking = localBookings.find((b) => b._id === bookingId);
    if (!booking) {
      toast.error("Booking not found");
      return;
    }

    // Trim all inputs
    const trimmedMeetingLink = meetingLink.trim();
    const trimmedLocation = locationDetails.trim();
    const trimmedInstructions = specialInstructions.trim();

    // Google Meet URL pattern validation
    const isValidGoogleMeetLink = (link) => {
      const regex =
        /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\/)?(\?.*)?$/i;
      return regex.test(link);
    };

    // Validate based on modality
    if (booking.modality === "online") {
      if (!trimmedMeetingLink) {
        toast.error("Please provide a meeting link");
        return;
      }
      if (!isValidGoogleMeetLink(trimmedMeetingLink)) {
        toast.error(
          "Invalid Google Meet link. Format: https://meet.google.com/xxx-xxxx-xxx"
        );
        return;
      }
      if (
        !trimmedMeetingLink.startsWith("http://") &&
        !trimmedMeetingLink.startsWith("https://")
      ) {
        toast.error("Please include http:// or https:// in the meeting link");
        return;
      }
    } else {
      // face-to-face
      if (!trimmedLocation || trimmedLocation.length < 6) {
        toast.error(
          `Please provide location details (${
            6 - trimmedLocation.length
          } more characters needed)`
        );
        return;
      }
    }

    setIsConfirming(true);
    const toastId = toast.loading("Confirming booking...");

    try {
      // Create payload based on modality
      const payload = {
        specialInstructions: trimmedInstructions,
      };

      if (booking.modality === "online") {
        payload.meetingLink = trimmedMeetingLink;
      } else {
        payload.locationDetails = trimmedLocation;
      }

      const response = await axios.patch(
        `${BASE_URL}/api/bookings/${bookingId}/confirm`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setLocalBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? {
                ...b,
                status: "confirmed",
                ...(booking.modality === "online"
                  ? { meetingLink: trimmedMeetingLink }
                  : { locationDetails: trimmedLocation }),
                specialInstructions: trimmedInstructions,
              }
            : b
        )
      );

      toast.success("Booking confirmed successfully", { id: toastId });
      setAcceptDialogOpen(false);
      setMeetingLink("");
      setLocationDetails("");
      setSpecialInstructions("");
    } catch (error) {
      console.error("Full confirmation error:", error);

      let errorMessage = "Failed to confirm booking. Please try again.";

      if (error.response) {
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          errorMessage;

        if (error.response.data?.details?.includes("meetingLink")) {
          errorMessage = "Please provide a valid meeting URL";
        } else if (error.response.data?.details?.includes("locationDetails")) {
          errorMessage = "Location details must be at least 10 characters";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsConfirming(false);
    }
  };

  const getCurrentBooking = () => {
    return localBookings.find((b) => b._id === currentBookingId);
  };

  const handleCompleteAction = async () => {
    if (!proofImage) {
      toast.error("Please select an image");
      return;
    }

    setIsConfirming(true);
    const toastId = toast.loading("Uploading proof and completing session...");

    const formData = new FormData();
    formData.append("proof", proofImage);

    try {
      // Determine if it's an individual booking or group session
      const individualBooking = localBookings.find(
        (b) => b._id === completingBookingId
      );
      const groupBooking = groupBookings.find(
        (b) => b._id === completingBookingId
      );

      let endpoint;
      let updateStateFunction;

      if (individualBooking) {
        endpoint = `${BASE_URL}/api/bookings/${completingBookingId}/complete`;
        updateStateFunction = () => {
          setLocalBookings((prev) =>
            prev.map((b) =>
              b._id === completingBookingId ? { ...b, status: "completed" } : b
            )
          );
        };
      } else if (groupBooking) {
        endpoint = `${BASE_URL}/api/group-sessions/booking/${completingBookingId}/complete`;
        updateStateFunction = () => {
          setGroupBookings((prev) =>
            prev.map((booking) =>
              booking._id === completingBookingId
                ? { ...booking, status: "completed" }
                : booking
            )
          );
        };
      } else {
        toast.error("Booking not found");
        return;
      }

      // Make the API call
      await axios.patch(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update the appropriate state
      updateStateFunction();

      const sessionType = individualBooking ? "Session" : "Group session";
      toast.success(`${sessionType} marked as completed`, {
        id: toastId,
      });

      setCompleteDialogOpen(false);
      setProofImage(null);
      setCompletingBookingId(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Completion error:", error);
      toast.error(error.response?.data?.error || "Failed to complete session", {
        id: toastId,
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancelBooking = async () => {
    const token = localStorage.getItem("token");
    console.log(localBookings);
    if (!token) {
      toast.error("Please login again");
      return;
    }
    console.log("Using token:", token); // Verify token exists

    if (!declineReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setIsDeclining(true);
    const toastId = toast.loading("Cancelling booking...");
    const originalBookings = [...localBookings];

    try {
      // Optimistic UI update
      setLocalBookings((prev) =>
        prev.filter((booking) => booking._id !== currentBookingId)
      );
      const booking = localBookings.find((obj) => obj._id === currentBookingId) || groupBookings.find((obj) => obj._id === currentBookingId);
      console.log("Sending decline request for:", currentBookingId); // Debug log
      const endpoint =
        (booking.sessionType === "group" || booking.participants)
          ? `${BASE_URL}/api/group-sessions/${sessionToCancel}/cancel-by-tutor`
          : `${BASE_URL}/api/bookings/${currentBookingId}/cancel`;
      const response = await axios.patch(
        endpoint,
        { reason: declineReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Decline response:", response.data); // Debug log

      toast.success("Booking cancelled successfully", { id: toastId });
      setDeclineDialogOpen(false);
      setDeclineReason("");
      setSessionToCancel(null);
    } catch (error) {
      // Rollback on error
      setLocalBookings(originalBookings);
      console.error("Full error object:", error); // Log complete error
      console.error("Error response:", error.response); // Axios response

      // const errorMessage =
      //   error.response?.data?.error || error.response?.status === 401
      //     ? "Unauthorized - Please login again"
      //     : error.response?.status === 403
      //     ? "You don't have permission to cancel this booking"
      //     : "Failed to cancel booking";

      const errorMessage = error.response.data.error;
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsDeclining(false);
      setDeclineDialogOpen(false);
      setDeclineReason("");
      setSessionToCancel(null);
      fetchBookings();
      fetchGroupBookings();
    }
  };

  const openCancelDialog = (bookingId) => {
    setSessionToCancel(bookingId);
    setCurrentBookingId(bookingId);
    setDeclineDialogOpen(true);
  };

  // Helper function to check if current time is within session window
  const getSessionStatus = (
    dateStr,
    startTimeStr,
    endTimeStr,
    bookingStatus = "pending"
  ) => {
    try {
      const today = new Date();

      // Parse the ISO date string directly
      const sessionDate = new Date(dateStr);

      // Combine date with time strings
      const startDateTime = new Date(sessionDate);
      const [startHours, startMinutes] = startTimeStr.split(":").map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(sessionDate);
      const [endHours, endMinutes] = endTimeStr.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Calculate 24 hours before session
      const twentyFourHoursBefore = new Date(
        startDateTime.getTime() - 24 * 60 * 60 * 1000
      );

      // Allow joining 15 minutes before start time
      const joinWindowStart = new Date(
        startDateTime.getTime() - 15 * 60 * 1000
      );

      // Check if within 24-hour confirmation window
      if (
        bookingStatus === "pending" &&
        isAfter(today, twentyFourHoursBefore) &&
        isBefore(today, startDateTime)
      ) {
        return {
          status: "pending-confirmation",
          active: false,
          hoursUntilSession: Math.round(
            (startDateTime - today) / (60 * 60 * 1000)
          ),
        };
      }

      // Existing status checks
      if (isBefore(today, joinWindowStart)) {
        return { status: "upcoming", active: false };
      }
      if (isBefore(today, endDateTime) && isAfter(today, joinWindowStart)) {
        return { status: "active", active: true };
      }
      return { status: "ended", active: false };
    } catch (error) {
      console.error("Error checking session time:", error);
      return { status: "error", active: false };
    }
  };

  const handleViewParticipants = (booking) => {
    if (booking.sessionType === "group" && booking.participants) {
      setCurrentParticipants(booking.participants);
      setParticipantsDialogOpen(true);
    }
  };

  // Helper function to filter bookings by date
  const filterBookingsByDate = (bookings) => {
    const today = new Date();

    switch (dateFilter) {
      case "today":
        return bookings.filter((booking) => {
          const bookingDate = new Date(booking.date);
          return isToday(bookingDate);
        });
      case "tomorrow":
        return bookings.filter((booking) => {
          const bookingDate = new Date(booking.date);
          return isTomorrow(bookingDate);
        });
      case "all":
      default:
        return bookings;
    }
  };

  if (status === "upcoming") {
    const confirmedBookings = localBookings.filter(
      (b) =>
        b.status === "confirmed" &&
        !(b.sessionType === "group" || b.groupSession?.isGroup)
    );

    const allUpcomingSessions = [
      ...confirmedBookings,
      ...groupBookings
        .filter((groupBooking) => groupBooking.status === "open")
        .map((groupBooking) => ({
          ...groupBooking,
          sessionType: "group",
        })),
    ].sort((a, b) => {
      // Combine date and startTime for comparison
      const aDateTime = new Date(a.date).setHours(
        ...a.startTime.split(":").map(Number)
      );
      const bDateTime = new Date(b.date).setHours(
        ...b.startTime.split(":").map(Number)
      );

      return aDateTime - bDateTime;
    });

    // Apply date filter
    const filteredUpcomingSessions = filterBookingsByDate(allUpcomingSessions);

    if (allUpcomingSessions.length === 0) {
      return <div className="text-center py-8">No upcoming bookings</div>;
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {dateFilter === "all" && "All Dates"}
                {dateFilter === "today" && "Today"}
                {dateFilter === "tomorrow" && "Tomorrow"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => setDateFilter("all")}
                className={dateFilter === "all" ? "bg-accent" : ""}
              >
                All Dates
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("today")}
                className={dateFilter === "today" ? "bg-accent" : ""}
              >
                Today
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDateFilter("tomorrow")}
                className={dateFilter === "tomorrow" ? "bg-accent" : ""}
              >
                Tomorrow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* Show filter status */}
        {dateFilter !== "all" && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredUpcomingSessions.length} session
            {filteredUpcomingSessions.length !== 1 ? "s" : ""} for {dateFilter}
            {filteredUpcomingSessions.length === 0 && " - no sessions found"}
          </div>
        )}

        {filteredUpcomingSessions.map((booking) => {
          const sessionStatus = getSessionStatus(
            booking.date,
            booking.startTime,
            booking.endTime,
            booking.status
          );

          // Check if session has already started/ended
          const sessionDate = new Date(booking.date);
          const sessionStartTime = booking.startTime;
          const [hours, minutes] = sessionStartTime.split(":").map(Number);
          sessionDate.setHours(hours, minutes, 0, 0);

          const now = new Date();
          const twentyFourHoursBeforeSession = new Date(
            sessionDate.getTime() - 24 * 60 * 60000
          );

          // Get participant count for group sessions
          const participantCount =
            booking.sessionType === "group"
              ? booking.participants?.length || 0
              : 0;

          return (
            <div
              key={booking._id}
              className="rounded-lg border border-[#3b2762]"
            >
              <div className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    {/* Updated Avatar section with conditional rendering */}
                    {booking.sessionType === "group" ? (
                      <CustomTooltip
                        content={
                          participantCount
                            ? "Click to view participants"
                            : "No participants yet"
                        }
                        position="right"
                      >
                        <div
                          className="h-10 w-10 rounded-full bg-[#3b2762] flex items-center justify-center cursor-pointer"
                          onClick={() => handleViewParticipants(booking)}
                        >
                          <Users className="h-5 w-5 text-white" />
                        </div>
                      </CustomTooltip>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            `${BASE_URL}/uploads/${booking.student.profileImage}` ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={booking.student?.name || "Student"}
                        />
                        <AvatarFallback>
                          {booking.student?.name
                            ? booking.student.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()
                            : "ST"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="font-medium">
                        {booking.sessionType === "group"
                          ? `${booking.topic} (Group Session)`
                          : `${booking.topic} with${" "} ${
                              booking.student?.name || "Student"
                            }`}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        <span>
                          {booking.formattedDate},{" "}
                          {convert24to12(booking.startTime)} -{" "}
                          {convert24to12(booking.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {sessionStatus.status === "ended" && (
                    <Badge
                      variant="outline"
                      className="text-md bg-gray-100 text-gray-700"
                    >
                      Past
                    </Badge>
                  )}

                  {/* Ellipsis menu for cancel booking */}
                  {/* Cancelling within 24 hours of session start time */}
                  {now >= twentyFourHoursBeforeSession && sessionStatus.status !== "ended" && (
                    <CustomTooltip
                      content="Cancelling within 24 hours of session start time"
                      position="left"
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => {
                              setCurrentBookingId(booking._id);
                              setWithIn24hrsNoticeCancelDialogOpen(true);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CustomTooltip>
                  )}
                  {/* For bookings more than 24hours */}
                  {!(now >= twentyFourHoursBeforeSession) &&
                    // booking.sessionType !== "group" && 
                    (
                      <CustomTooltip
                        content="For bookings more than 24hours before sessions"
                        position="left"
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => openCancelDialog(booking._id)}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CustomTooltip>
                    )}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div className="text-sm">
                  <span className="font-medium">Session format:</span>{" "}
                  {booking.modality === "online"
                    ? "Google Meeting"
                    : "Face-to-Face"}
                  {booking.modality === "face-to-face" &&
                    booking.locationDetails && (
                      <span>: {booking.locationDetails}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                  {sessionStatus.status === "ended" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        className="border bg-[#3b2762] text-white hover:cursor-pointer hover:bg-[hsl(260,43%,20%)]"
                        size="sm"
                        onClick={() => {
                          setCompletingBookingId(booking._id);
                          setCompleteDialogOpen(true);
                        }}
                        disabled={isConfirming}
                      >
                        {isConfirming ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4 text-[#efc940]" />
                            Session Completed
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCompletingBookingId(booking._id);
                          setOtherOptionDialogOpen(true);
                        }}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" />
                        Other Option
                      </Button>
                    </div>
                  ) : (
                    <>
                      {booking.modality === "online" && booking.meetingLink && (
                        <CustomTooltip
                          content={
                            sessionStatus.active
                              ? "Click to join the session now"
                              : sessionStatus.status === "ended"
                              ? "The session has already passed"
                              : `Session will be available 15 min. before ${convert24to12(
                                  booking.startTime
                                )} on ${booking.formattedDate}`
                          }
                          position="left"
                        >
                          <Button
                            size="sm"
                            className={`border ${
                              sessionStatus.active
                                ? "bg-[#3b2762] text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                            disabled={!sessionStatus.active}
                          >
                            <Video
                              className={`mr-2 h-3 w-3 ${
                                sessionStatus.active
                                  ? "text-[#efc940]"
                                  : "text-gray-500"
                              }`}
                            />
                            {sessionStatus.active ? (
                              <a
                                href={booking.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:no-underline"
                              >
                                Start Session
                              </a>
                            ) : (
                              <span>
                                {sessionStatus.status === "upcoming"
                                  ? "Session Not Started"
                                  : `${sessionStatus.status}`}
                              </span>
                            )}
                          </Button>
                        </CustomTooltip>
                      )}
                      {booking.locationDetails &&
                        booking.specialInstructions && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setCurrentInstructions(
                                booking.specialInstructions
                              );
                              setCurrentLocationDetails(
                                booking.locationDetails
                              );
                              setInstructionsOpen(true);
                            }}
                          >
                            <MessageSquare className="mr-2 h-3 w-3" />
                            View Instructions
                          </Button>
                        )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Participants Dialog */}
        <Dialog
          open={participantsDialogOpen}
          onOpenChange={setParticipantsDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session Participants</DialogTitle>
              <DialogDescription>
                List of students enrolled in this group session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentParticipants.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No participants found
                </p>
              ) : (
                currentParticipants.map((participant, index) => (
                  <div
                    key={participant._id || index}
                    className="flex items-center gap-3 p-2 rounded-lg border"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          `${BASE_URL}/uploads/${participant.student?.profileImage}` ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        alt={participant.student?.name || "Participant"}
                      />
                      <AvatarFallback>
                        {participant.student?.name
                          ? participant.student.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                          : "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {participant.student?.name || "Unknown Student"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {format(new Date(participant.joinedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setParticipantsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pop-up after session complete button */}
        <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Proof of Attendance</DialogTitle>
              <DialogDescription>
                Please upload a screenshot or photo proving you attended the
                session.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProofImage(file);
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
                    setCompleteDialogOpen(false);
                    setProofImage(null);
                    setCompletingBookingId(null);
                    setImagePreview(null); // Clear preview on cancel
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleCompleteAction} disabled={isConfirming}>
                  {isConfirming ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog to notify tutor that excessive cancellation of sessions within 24hrs can lead to account deactivation */}
        <AlertDialog
          open={withIn24hrsNoticeCancelDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setWithIn24hrsNoticeCancelDialogOpen(false);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Session Start Time is Under 24 hours
              </AlertDialogTitle>
              <AlertDialogDescription>
                Excessive cancellation of sessions within 24hrs can lead to
                account deactivation.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Proceed</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setWithIn24hrsNoticeCancelDialogOpen(false);
                  openCancelDialog(currentBookingId);
                }}
                disabled={isDeclining}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeclining ? "Cancelling..." : "Confirm Cancellation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Booking Alert Dialog */}
        <AlertDialog
          open={declineDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDeclineDialogOpen(false);
              setDeclineReason("");
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently cancel the
                booking.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for cancellation</Label>
                <Input
                  id="reason"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Enter your reason (e.g., emergency, unavailable, etc.)"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelBooking}
                disabled={isDeclining}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeclining ? "Cancelling..." : "Confirm Cancellation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* View Instruction Dialog */}
        <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <DialogContent className="max-w-lg rounded-xl">
            <DialogHeader className="text-left pb-3">
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                Session Instructions
              </DialogTitle>
            </DialogHeader>

            <div className="px-1">
              <div className="rounded-lg bg-gradient-to-br from-blue-50/50 to-purple-50/30 border border-blue-100/50 p-4">
                <div className="min-h-[100px]">
                  {currentInstructions || currentLocationDetails ? (
                    <div className="space-y-3">
                      {/* Location Details */}
                      {currentLocationDetails && (
                        <div className="bg-white rounded-md p-3 border border-gray-200">
                          <h3 className="font-medium text-gray-700 mb-2 text-xs uppercase tracking-wide text-blue-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location Details
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {currentLocationDetails}
                          </p>
                        </div>
                      )}

                      {/* Main Instructions */}
                      {currentInstructions && (
                        <div className="bg-white rounded-md p-3 border border-gray-200">
                          <h3 className="font-medium text-gray-700 mb-2 text-xs uppercase tracking-wide text-blue-600">
                            Custom Instructions
                          </h3>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {currentInstructions}
                          </p>
                        </div>
                      )}

                      {/* Standard Requirements */}
                      <div className="bg-white rounded-md p-3 border border-gray-200">
                        <h3 className="font-medium text-gray-700 mb-2 text-xs uppercase tracking-wide text-blue-600">
                          General Requirements
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 p-1">
                            <div className="flex items-center justify-center w-5 h-5 bg-yellow-100 rounded-full">
                              <span className="text-yellow-600 text-xs font-bold">
                                •
                              </span>
                            </div>
                            <span className="text-gray-700 text-sm">
                              Bring your student ID
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-1">
                            <div className="flex items-center justify-center w-5 h-5 bg-yellow-100 rounded-full">
                              <span className="text-yellow-600 text-xs font-bold">
                                •
                              </span>
                            </div>
                            <span className="text-gray-700 text-sm">
                              Arrive 5 minutes early
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <BookOpen className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium mb-1">
                        No Special Instructions
                      </p>
                      <p className="text-gray-400 text-xs mb-4">
                        Follow the general requirements below
                      </p>

                      <div className="w-full">
                        <div className="bg-white rounded-md p-3 border border-gray-200">
                          <h3 className="font-medium text-gray-700 mb-2 text-xs uppercase tracking-wide text-blue-600">
                            General Requirements
                          </h3>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 p-1">
                              <div className="flex items-center justify-center w-5 h-5 bg-yellow-100 rounded-full">
                                <span className="text-yellow-600 text-xs font-bold">
                                  •
                                </span>
                              </div>
                              <span className="text-gray-700 text-sm">
                                Bring your student ID
                              </span>
                            </div>
                            <div className="flex items-center gap-2 p-1">
                              <div className="flex items-center justify-center w-5 h-5 bg-yellow-100 rounded-full">
                                <span className="text-yellow-600 text-xs font-bold">
                                  •
                                </span>
                              </div>
                              <span className="text-gray-700 text-sm">
                                Arrive 5 minutes early
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="px-1 pt-4">
              <Button
                onClick={() => setInstructionsOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm"
              >
                Got it!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Other Option Dialog */}
        <Dialog
          open={otherOptionDialogOpen}
          onOpenChange={setOtherOptionDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report No-Show</DialogTitle>
              <DialogDescription>
                Please select who didn't attend the session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup
                value={noShowOption}
                onValueChange={(value) => setNoShowOption(value)}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tutor" id="tutor" />
                  <Label htmlFor="tutor">I didn't show up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">The student didn't show up</Label>
                </div>
              </RadioGroup>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOtherOptionDialogOpen(false);
                    setNoShowOption("");
                    setNoShowReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    const toastId = toast.loading(
                      "Processing no-show report..."
                    );
                    try {
                      const response = await axios.patch(
                        `${BASE_URL}/api/bookings/${completingBookingId}/cancel`,
                        {
                          reason:
                            noShowOption === "tutor"
                              ? `Tutor didn't show up`
                              : `Student didn't show up`,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
                          },
                        }
                      );

                      setLocalBookings((prev) =>
                        prev.map((b) =>
                          b._id === completingBookingId
                            ? { ...b, status: "no-show" }
                            : b
                        )
                      );

                      toast.success("No-show reported successfully", {
                        id: toastId,
                      });
                      setOtherOptionDialogOpen(false);
                      setNoShowOption("");
                      setNoShowReason("");
                      console.log(response);
                    } catch (error) {
                      console.error("No-show report error:", error);
                      toast.error(
                        error.response?.data?.error ||
                          "Failed to report no-show",
                        { id: toastId }
                      );
                    }
                  }}
                  disabled={!noShowOption}
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (status === "completed") {
    const completedBookings = localBookings
      .filter(
        (b) =>
          b.status === "completed" &&
          !(b.sessionType === "group" || b.groupSession?.isGroup)
      )
      .sort((a, b) => {
        if (!a.review?.rating && b.review?.rating) return -1;
        if (a.review?.rating && !b.review?.rating) return 1;
        return new Date(b.date) - new Date(a.date);
      });

    const allCompletedSessions = [
      ...completedBookings,
      ...groupBookings
        .filter((groupBooking) => groupBooking.status === "completed")
        .map((groupBooking) => ({
          ...groupBooking,
          sessionType: "group",
        })),
    ].sort((a, b) => {
      // Combine date and startTime for comparison
      const aDateTime = new Date(a.date).setHours(
        ...a.startTime.split(":").map(Number)
      );
      const bDateTime = new Date(b.date).setHours(
        ...b.startTime.split(":").map(Number)
      );

      return bDateTime - aDateTime;
    });
    console.log(`All Completed Bookings`, allCompletedSessions);
    if (allCompletedSessions.length === 0) {
      return <div className="text-center py-8">No completed sessions</div>;
    }

    // Updated handleRefreshCompleted
    const handleRefreshCompleted = async () => {
      setIsRefreshing(true);
      const toastId = toast.loading("Refreshing bookings and reviews...");

      try {
        // Clear all existing reviews to force refetch
        setGroupSessionReviews({});

        // Fetch bookings
        await Promise.all([fetchBookings(), fetchGroupBookings()]);

        toast.success("Bookings and reviews updated successfully", {
          id: toastId,
        });
      } catch (error) {
        console.error("Refresh error:", error);
        toast.error("Failed to refresh some data", { id: toastId });
      } finally {
        setIsRefreshing(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCompleted}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
        {allCompletedSessions.map((booking) => (
          <CompletedSessionItem
            key={booking._id}
            booking={booking}
            fetchGroupSessionReviews={fetchGroupSessionReviews}
            groupSessionReviews={groupSessionReviews}
            loadingReviews={loadingReviews}
            handleViewParticipants={handleViewParticipants}
          />
        ))}

        {/* Participants Dialog */}
        <Dialog
          open={participantsDialogOpen}
          onOpenChange={setParticipantsDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session Participants</DialogTitle>
              <DialogDescription>
                List of students enrolled in this group session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentParticipants.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No participants found
                </p>
              ) : (
                currentParticipants.map((participant, index) => (
                  <div
                    key={participant._id || index}
                    className="flex items-center gap-3 p-2 rounded-lg border"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`${BASE_URL}/uploads/${participant.student?.profileImage}`}
                        alt={participant.student?.name || "Participant"}
                      />
                      <AvatarFallback>
                        {participant.student?.name
                          ? participant.student.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                          : "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {participant.student?.name || "Unknown Student"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {format(new Date(participant.joinedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setParticipantsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (status === "cancelled") {
    // const cancelledBookings = localBookings.filter(
    //   (b) => b.status === "cancelled"
    // );
    const cancelledBookings = localBookings
      .filter(
        (cancelledBooks) =>
          (cancelledBooks.status === "cancelled" ||
            cancelledBooks.status === "expired") &&
          !(
            cancelledBooks.sessionType === "group" ||
            cancelledBooks.groupSession?.isGroup
          )
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Newest first

    const allCancelledSessions = [
      ...cancelledBookings,
      ...groupBookings
        .filter((groupBooking) => groupBooking.status === "cancelled")
        .map((groupBooking) => ({
          ...groupBooking,
          sessionType: "group",
        })),
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    console.log("All cancelled sessions", allCancelledSessions);

    if (allCancelledSessions.length === 0) {
      return <div className="text-center py-8">No cancelled bookings</div>;
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
        {allCancelledSessions.map((booking) => (
          <div key={booking._id} className="rounded-lg border">
            <div className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  {/* Updated Avatar section with conditional rendering */}
                  {booking.sessionType === "group" ? (
                    <div className="h-10 w-10 rounded-full bg-[#3b2762] flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`${BASE_URL}/uploads/${booking.student?.profileImage}`}
                        alt={booking.student?.name || "Student"}
                      />
                      <AvatarFallback>
                        {booking.student?.name
                          ? booking.student.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                          : "ST"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <h3 className="font-medium">
                      {booking.sessionType === "group"
                        ? `${booking.topic} (Group Session)`
                        : `${booking.topic} with${" "} ${
                            booking.student?.name || "Student"
                          }`}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarClock className="h-3 w-3" />
                      <span>
                        {booking.formattedDate},{" "}
                        {convert24to12(booking.startTime)} -{" "}
                        {convert24to12(booking.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="w-fit bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
                >
                  Cancelled
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between p-4">
              {booking.status === "expired" ? (
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Reason:</span>{" "}
                    {booking.cancellationReason || "No reason provided"}
                  </div>
                  <div>
                    <span className="font-medium">Cancelled by:</span>{" "}
                    <span className="capitalize">{booking.cancelledBy}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Reason:</span>{" "}
                    {booking.cancellationReason || "No reason provided"}
                  </div>
                  <div>
                    <span className="font-medium">Cancelled by:</span>{" "}
                    <span className="capitalize">{booking.cancelledBy}</span>
                  </div>
                </div>
              )}
              {/* <div className="flex items-center gap-2">
                <Button size="sm">Reschedule</Button>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "requests") {
    const pendingBookings = localBookings
      .filter(
        (pendingReq) =>
          pendingReq.status === "pending" && pendingReq.sessionType !== "group"
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

    if (pendingBookings.length === 0) {
      return (
        <div className="text-center py-8">No pending booking requests</div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RotateCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
        </div>
        {pendingBookings.map((booking) => {
          const sessionStatus = getSessionStatus(
            booking.date,
            booking.startTime,
            booking.endTime,
            booking.status
          );
          return (
            <div
              key={booking._id}
              className={`rounded-lg border border-[#3b2762] booking-item ${
                currentBookingId === booking._id && isDeclining
                  ? "booking-item-removing"
                  : ""
              }`}
            >
              <div className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    {/* Updated Avatar section with conditional rendering */}
                    {booking.sessionType === "group" ? (
                      <div className="h-10 w-10 rounded-full bg-[#3b2762] flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`${BASE_URL}/uploads/${booking.student?.profileImage}`}
                          alt={booking.student?.name || "Student"}
                        />
                        <AvatarFallback>
                          {booking.student?.name
                            ? booking.student.name
                                .split(" ")
                                .map((word) => word[0])
                                .join("")
                                .toUpperCase()
                            : "ST"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="font-medium">
                        {booking.topic} with{" "}
                        {booking.student?.name || "Student"}{" "}
                        {booking.groupSession.isGroup ? "(Group Session)" : ""}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        <span>
                          {booking.formattedDate},{" "}
                          {convert24to12(booking.startTime)} -{" "}
                          {convert24to12(booking.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between p-4">
                <div className="text-sm">
                  <span className="font-medium">Modality:</span>{" "}
                  {booking.modality === "online"
                    ? "Google Meeting"
                    : "Face-to-Face"}
                </div>
                {status === "requests" && booking.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={declineDialogOpen}
                      onOpenChange={setDeclineDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setCurrentBookingId(booking._id);
                            setDeclineDialogOpen(true);
                          }}
                        >
                          <X className="mr-2 h-3 w-3" />
                          Decline
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Decline Booking Request</DialogTitle>
                          <DialogDescription>
                            Please let the student know why you're declining
                            this session.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Textarea
                              placeholder="Example: I'm not available at this time, or This topic is outside my expertise..."
                              value={declineReason}
                              onChange={(e) => setDeclineReason(e.target.value)}
                              minLength={10}
                              className="min-h-[100px]"
                            />
                            <p className="text-sm text-muted-foreground">
                              Minimum 10 characters required
                            </p>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setDeclineDialogOpen(false)}
                              disabled={isDeclining}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleDecline}
                              disabled={
                                isDeclining || declineReason.length < 10
                              }
                            >
                              {isDeclining ? (
                                <>
                                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                                  Declining...
                                </>
                              ) : (
                                "Confirm Decline"
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {sessionStatus.status === "pending-confirmation" ? (
                      <CustomTooltip
                        content="Cannot accept within 24 hours of session time"
                        position="left"
                      >
                        <Button variant="ghost" size="icon" disabled>
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Tooltip</span>
                        </Button>
                      </CustomTooltip>
                    ) : (
                      sessionStatus.status !== "ended" && (
                        <Dialog
                          open={acceptDialogOpen}
                          onOpenChange={(open) => {
                            setAcceptDialogOpen(open);
                            if (!open) {
                              setMeetingLink("");
                              setLocationDetails("");
                              setSpecialInstructions("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              className="bg-[hsl(260,43%,27%)] hover:bg-[hsl(260,43%,20%)] hover:cursor-pointer"
                              size="sm"
                              onClick={() => setCurrentBookingId(booking._id)}
                            >
                              <Check className="mr-2 h-3 w-3 text-[#efc940]" />
                              Accept
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Booking</DialogTitle>
                              <DialogDescription>
                                {getCurrentBooking()?.modality === "online"
                                  ? "Please provide meeting details"
                                  : "Please provide location details"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {getCurrentBooking()?.modality === "online" ? (
                                <div className="grid gap-2">
                                  <Input
                                    placeholder="https://meet.google.com/abc-defg-hij"
                                    value={meetingLink}
                                    onChange={(e) =>
                                      setMeetingLink(e.target.value)
                                    }
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    Required for online sessions
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <div className="grid gap-2">
                                    <Textarea
                                      placeholder="Example: Main Library, Room 207, Canteen"
                                      value={locationDetails}
                                      onChange={(e) =>
                                        setLocationDetails(e.target.value)
                                      }
                                      minLength={6}
                                      className="min-h-[100px]"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      {locationDetails.length}/6 characters
                                      (minimum required)
                                    </p>
                                  </div>
                                  <div className="grid gap-2">
                                    <Textarea
                                      placeholder="Any special instructions for the student (optional)"
                                      value={specialInstructions}
                                      onChange={(e) =>
                                        setSpecialInstructions(e.target.value)
                                      }
                                      maxLength={500}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      {specialInstructions.length}/500
                                      characters
                                    </p>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAcceptDialogOpen(false);
                                    setMeetingLink("");
                                    setLocationDetails("");
                                    setSpecialInstructions("");
                                  }}
                                  disabled={isConfirming}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleConfirm(currentBookingId)
                                  }
                                  disabled={
                                    isConfirming ||
                                    (getCurrentBooking()?.modality ===
                                      "online" &&
                                      !meetingLink.trim()) ||
                                    (getCurrentBooking()?.modality ===
                                      "face-to-face" &&
                                      (!locationDetails.trim() ||
                                        locationDetails.trim().length < 6))
                                  }
                                >
                                  {isConfirming ? (
                                    <>
                                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                                      Confirming...
                                    </>
                                  ) : (
                                    "Confirm Booking"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )
                    )}
                    {/* {sessionStatus.status !== "ended" &&
                      sessionStatus.status !== "pending-confirmation" && (
                        <Dialog
                          open={acceptDialogOpen}
                          onOpenChange={(open) => {
                            setAcceptDialogOpen(open);
                            if (!open) {
                              setMeetingLink("");
                              setLocationDetails("");
                              setSpecialInstructions("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setCurrentBookingId(booking._id)}
                            >
                              <Check className="mr-2 h-3 w-3" />
                              Accept
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Booking</DialogTitle>
                              <DialogDescription>
                                {getCurrentBooking()?.modality === "online"
                                  ? "Please provide meeting details"
                                  : "Please provide location details"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {getCurrentBooking()?.modality === "online" ? (
                                <div className="grid gap-2">
                                  <Input
                                    placeholder="https://meet.google.com/abc-defg-hij"
                                    value={meetingLink}
                                    onChange={(e) =>
                                      setMeetingLink(e.target.value)
                                    }
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    Required for online sessions
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <div className="grid gap-2">
                                    <Textarea
                                      placeholder="Example: Main Library, Room 207, Canteen"
                                      value={locationDetails}
                                      onChange={(e) =>
                                        setLocationDetails(e.target.value)
                                      }
                                      minLength={6}
                                      className="min-h-[100px]"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      {locationDetails.length}/6 characters
                                      (minimum required)
                                    </p>
                                  </div>
                                  <div className="grid gap-2">
                                    <Textarea
                                      placeholder="Any special instructions for the student (optional)"
                                      value={specialInstructions}
                                      onChange={(e) =>
                                        setSpecialInstructions(e.target.value)
                                      }
                                      maxLength={500}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      {specialInstructions.length}/500
                                      characters
                                    </p>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setAcceptDialogOpen(false);
                                    setMeetingLink("");
                                    setLocationDetails("");
                                    setSpecialInstructions("");
                                  }}
                                  disabled={isConfirming}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleConfirm(currentBookingId)
                                  }
                                  disabled={
                                    isConfirming ||
                                    (getCurrentBooking()?.modality ===
                                      "online" &&
                                      !meetingLink.trim()) ||
                                    (getCurrentBooking()?.modality ===
                                      "face-to-face" &&
                                      (!locationDetails.trim() ||
                                        locationDetails.trim().length < 6))
                                  }
                                >
                                  {isConfirming ? (
                                    <>
                                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                                      Confirming...
                                    </>
                                  ) : (
                                    "Confirm Booking"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                    {(sessionStatus.status === "ended" ||
                      sessionStatus.status === "pending-confirmation") && (
                      <CustomTooltip
                        content={
                          sessionStatus.status === "ended"
                            ? "This session has already ended"
                            : "Cannot accept within 24 hours of session"
                        }
                        position="left"
                      >
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Tooltip</span>
                        </Button>
                      </CustomTooltip>
                    )} */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

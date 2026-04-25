import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarClock,
  MessageSquare,
  Star,
  Video,
  MoreHorizontal,
  Check,
  X,
  Info,
  Loader,
  RotateCw,
  BookOpen,
  MapPin,
  Filter,
  CreditCard,
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
  isAfter as isAfterDate,
  parseISO,
} from "date-fns";
import { CustomTooltip } from "../CustomTooltip";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function SessionsList({ status, bookings: initialBookings }) {
  const { user } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [
    withIn24hrsNoticeCancelDialogOpen,
    setWithIn24hrsNoticeCancelDialogOpen,
  ] = useState(false);

  const [declineReason, setDeclineReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);
  const [localBookings, setLocalBookings] = useState(initialBookings);
  const [currentBookingId, setCurrentBookingId] = useState(null);

  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [currentInstructions, setCurrentInstructions] = useState("");
  const [currentLocationDetails, setCurrentLocationDetails] = useState("");

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [currentReviewBooking, setCurrentReviewBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const [groupBookings, setGroupBookings] = useState([]);

  // Add filter state
  const [dateFilter, setDateFilter] = useState("all"); // "all", "today", "tomorrow"
  const [paymentFilter, setPaymentFilter] = useState("all"); // "all", "paid", "pending"

  // Add this useEffect hook for polling
  // Update this useEffect hook for polling
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
  }, [status, user?.id]); // Add user.id dependency
  let isMounted = true;

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

  // Add another useEffect to log when groupBookings actually updates
  useEffect(() => {
    console.log("Group bookings updated:", groupBookings);
  }, [groupBookings]);

  const handleReviewSubmit = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Replace with your actual API call
      const response = await axios.put(
        `${BASE_URL}/api/bookings/${currentReviewBooking._id}/review`,
        {
          rating,
          comment: reviewText,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Review submitted successfully!");
      setReviewDialogOpen(false);
      setRating(0);
      setReviewText("");
      fetchBookings();
      // Optionally refresh the bookings data
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
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
      const booking = localBookings.find((obj) => obj._id === currentBookingId);
      console.log("Sending decline request for:", currentBookingId); // Debug log
      const endpoint =
        booking.sessionType === "group"
          ? `${BASE_URL}/api/group-sessions/booking/${currentBookingId}/cancel`
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
      fetchBookings();
      fetchGroupBookings();
    }
  };

  const openCancelDialog = (bookingId) => {
    setCurrentBookingId(bookingId);
    setDeclineDialogOpen(true);
  };
  // Helper function to check if current time is within session window
  const getSessionStatus = (dateStr, startTimeStr, endTimeStr) => {
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

      // Allow joining 15 minutes before start time
      const joinWindowStart = addMinutes(startDateTime, -15);

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

  const handleRebook = (tutorId) => {
    navigate(`/dashboard/tutor-profile/${tutorId}`);
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

  // Helper function to filter bookings by payment status
  const filterBookingsByPayment = (bookings) => {
    switch (paymentFilter) {
      case "paid":
        return bookings.filter((booking) => booking.paymentStatus === "paid");
      case "pending":
        return bookings.filter(
          (booking) => booking.paymentStatus === "pending"
        );
      case "all":
      default:
        return bookings;
    }
  };

  // Combined filter function for completed sessions
  const filterCompletedSessions = (bookings) => {
    let filtered = bookings;

    // Apply payment filter first
    filtered = filterBookingsByPayment(filtered);

    // Then apply date filter
    filtered = filterBookingsByDate(filtered);

    return filtered;
  };

  if (status === "upcoming") {
    const confirmedBookingsIndividual = localBookings.filter(
      (b) => b.status === "confirmed" && b.sessionType !== "group"
    );

    const groupBookingsUpcoming = groupBookings
      .filter(
        (groupBooking) =>
          groupBooking.status === "pending" ||
          groupBooking.status === "confirmed"
      )
      .map((groupBooking) => ({
        ...groupBooking,
        sessionType: "group",
        // Add any other properties you need for consistent display
      }));

    const allUpcomingSessions = [
      ...confirmedBookingsIndividual,
      ...groupBookingsUpcoming,
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
            booking.endTime
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

          return (
            <div
              key={booking._id}
              className="rounded-lg border-1 border-[#3b2762]"
            >
              <div className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          `${BASE_URL}/uploads/${booking.tutor?.profileImage}` ||
                          "/placeholder.svg?height=40&width=40"
                        }
                        alt={booking.tutor?.name || "Tutor"}
                      />
                      <AvatarFallback>
                        {booking.tutor?.name
                          ? booking.tutor.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                          : "TN"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {booking.topic} with {booking.tutor?.name || "Tutor"}{" "}
                        {booking.sessionType === "group"
                          ? "(Group Session)"
                          : ""}
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
                  <div className="flex items-center gap-2">
                    {sessionStatus.status === "ended" && (
                      <Badge
                        variant="outline"
                        className="text-md bg-gray-100 text-gray-700"
                      >
                        Past
                      </Badge>
                    )}

                    {/* Tooltip here */}
                    {sessionStatus.status === "ended" && (
                      <CustomTooltip
                        content="Waiting for tutor's confirmation to complete this session"
                        position="left"
                      >
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Tooltip</span>
                        </Button>
                      </CustomTooltip>
                    )}

                    {/* Ellipsis menu for cancel booking */}
                    {/* Cancelling within 24 hours of session start time */}
                    {now >= twentyFourHoursBeforeSession && sessionStatus.status !== "ended" && (
                      <CustomTooltip
                        content="Cancelling within 24 hours of session start time will still require payment"
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
                    {!(now >= twentyFourHoursBeforeSession) && (
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
                            Join Session
                          </a>
                        ) : (
                          <span>
                            {sessionStatus.status === "upcoming"
                              ? "Session Not Started"
                              : "Session Ended"}
                          </span>
                        )}
                      </Button>
                    </CustomTooltip>
                  )}
                  {booking.locationDetails && booking.specialInstructions && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setCurrentInstructions(booking.specialInstructions);
                        setCurrentLocationDetails(booking.locationDetails);
                        setInstructionsOpen(true);
                      }}
                    >
                      <MessageSquare className="mr-2 h-3 w-3" />
                      View Instructions
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Alert Dialog to notify student that cancelling this booking would still make the booking payable */}
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
                If you cancel this booking, you would still have to pay.
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

                {(currentInstructions || currentLocationDetails) && (
                  <div className="mt-4 pt-3 border-t border-gray-200/50">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                      <p className="text-gray-600 font-medium text-xs">
                        From your tutor
                      </p>
                    </div>
                  </div>
                )}
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
      </div>
    );
  }

  if (status === "completed") {
    const completedBookings = localBookings
      .filter((b) => b.status === "completed")
      .sort((a, b) => {
        // First, prioritize bookings without reviews
        if (!a.review.rating && b.review.rating) return -1;
        if (a.review.rating && !b.review.rating) return 1;
        return new Date(b.date) - new Date(a.date);
      });

    // Apply combined filters for completed sessions
    const filteredCompletedSessions =
      filterCompletedSessions(completedBookings);

    if (completedBookings.length === 0) {
      return <div className="text-center py-8">No completed bookings</div>;
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {/* Filter Section */}
          <div className="flex gap-2">
            {/* Payment Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {paymentFilter === "all" && "All Payments"}
                  {paymentFilter === "paid" && "Paid"}
                  {paymentFilter === "pending" && "Pending"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => setPaymentFilter("all")}
                  className={paymentFilter === "all" ? "bg-accent" : ""}
                >
                  All Payments
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPaymentFilter("paid")}
                  className={paymentFilter === "paid" ? "bg-accent" : ""}
                >
                  Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setPaymentFilter("pending")}
                  className={paymentFilter === "pending" ? "bg-accent" : ""}
                >
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
        {(paymentFilter !== "all" || dateFilter !== "all") && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredCompletedSessions.length} session
            {filteredCompletedSessions.length !== 1 ? "s" : ""}
            {paymentFilter !== "all" && ` with ${paymentFilter} payment`}
            {paymentFilter !== "all" && dateFilter !== "all" && " and"}
            {dateFilter !== "all" && ` for ${dateFilter}`}
            {filteredCompletedSessions.length === 0 && " - no sessions found"}
          </div>
        )}

        {filteredCompletedSessions.map((booking) => {
          const isGroupSession = booking.sessionType === "group";

          return (
            <div
              key={booking._id}
              className="rounded-lg border-1 border-[#3b2762]"
            >
              <div className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          `${BASE_URL}/uploads/${booking.tutor?.profileImage}` ||
                          "/placeholder.svg?height=40&width=40"
                        }
                        alt={booking.tutor?.name || "Tutor"}
                      />
                      <AvatarFallback>
                        {booking.tutor?.name
                          ? booking.tutor.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                          : "TN"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {booking.topic} with {booking.tutor?.name || "Tutor"}{" "}
                        {isGroupSession && "(Group Session)"}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        <span>
                          {booking.formattedDate},{" "}
                          {convert24to12(booking.startTime)} -{" "}
                          {convert24to12(booking.endTime)}
                        </span>
                      </div>
                      {isGroupSession && booking.review?.rating && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Your individual review for this group session
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment status section remains the same */}
                  {booking.paymentStatus === "pending" && (
                    <div className="mt-3 p-2 border rounded-md bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Payment Due: ₱{booking.price?.toFixed(2) || "30.00"}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Please pay at the office to complete your session.
                      </p>
                    </div>
                  )}

                  {booking.paymentStatus === "paid" && (
                    <div className="mt-3 p-2 border rounded-md bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        Payment Complete: ₱
                        {booking.price?.toFixed(2) || "30.00"}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        Thank you for your payment. Your session is confirmed.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`w-fit ${
                        booking.paymentStatus === "paid"
                          ? "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      {booking.paymentStatus === "paid"
                        ? "Paid"
                        : "Payment Pending"}
                    </Badge>
                  </div>
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
                  {booking.review.rating ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#3b2762] text-[#3b2762] hover:bg-[#f5f1ff]"
                        >
                          <Star className="mr-2 h-3 w-3 text-[#efc940]" />
                          {isGroupSession ? "View Your Review" : "View Review"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>
                            {isGroupSession
                              ? "Your Group Session Review"
                              : "Your Review"}
                          </DialogTitle>
                          <DialogDescription>
                            {isGroupSession
                              ? `Your feedback for the group session on ${booking.topic}`
                              : `Your feedback for ${
                                  booking.tutor?.name || "the tutor"
                                }`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label className="block mb-2">Your Rating</Label>
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
                                Your Comments
                              </Label>
                              <div className="p-3 border rounded-md bg-gray-50">
                                {booking.review.comment}
                              </div>
                            </div>
                          )}
                          {isGroupSession && (
                            <div className="text-xs text-muted-foreground">
                              This review reflects your individual experience in
                              the group session.
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white"
                      onClick={() => {
                        setCurrentReviewBooking(booking);
                        setReviewDialogOpen(true);
                      }}
                    >
                      <Star className="mr-2 h-3 w-3 text-[#efc940]" />
                      Leave Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Review Dialog - Updated for group sessions */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {currentReviewBooking?.sessionType === "group"
                  ? "Review Group Session"
                  : "Leave a Review"}
              </DialogTitle>
              <DialogDescription>
                {currentReviewBooking?.sessionType === "group"
                  ? `Share your individual experience with the group session on ${currentReviewBooking?.topic}`
                  : `Share your experience with ${
                      currentReviewBooking?.tutor?.name || "the tutor"
                    }`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="rating" className="block mb-2">
                  How would you rate this{" "}
                  {currentReviewBooking?.sessionType === "group"
                    ? "group session"
                    : "session"}
                  ?
                </Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          (hoverRating || rating) >= star
                            ? "text-[#efc940] fill-[#efc940]"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="review" className="block mb-2">
                  Your Review{" "}
                  {currentReviewBooking?.sessionType === "group"
                    ? "(optional - share your individual experience)"
                    : "(optional)"}
                </Label>
                <textarea
                  id="review"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={
                    currentReviewBooking?.sessionType === "group"
                      ? "What did you like about the group session? How was the tutor's guidance? Any suggestions?"
                      : "What did you like about the session? Any suggestions for improvement?"
                  }
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              {currentReviewBooking?.sessionType === "group" && (
                <div className="text-sm text-muted-foreground p-2 bg-blue-50 rounded-md">
                  <Info className="h-4 w-4 inline mr-1" />
                  This review will reflect your individual experience in the
                  group session.
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setReviewDialogOpen(false);
                  setRating(0);
                  setReviewText("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3b2762] hover:bg-[#25193e]"
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview || !rating}
              >
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
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
          cancelledBooks.status === "cancelled" ||
          cancelledBooks.status === "expired"
      )
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Newest first

    if (cancelledBookings.length === 0) {
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
        {cancelledBookings.map((booking) => (
          <div
            key={booking._id}
            className="rounded-lg border-1 border-[#3b2762]"
          >
            <div className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        `${BASE_URL}/uploads/${booking.tutor?.profileImage}` ||
                        "/placeholder.svg?height=40&width=40"
                      }
                      alt={booking.tutor?.name || "Tutor"}
                    />
                    <AvatarFallback>
                      {booking.tutor?.name
                        ? booking.tutor.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase()
                        : "TN"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {booking.topic} with {booking.tutor?.name || "Tutor"}{" "}
                      {booking.sessionType === "group" ? "(Group Session)" : ""}
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
                    <span className="capitalize">
                      {booking.cancelledBy === "tutor"
                        ? "Tutor"
                        : "You (Student)"}
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white"
                  onClick={() => handleRebook(booking.tutor._id)}
                >
                  Rebook
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === "requests") {
    const bookingRequests = localBookings
      .filter(
        (bookingReq) =>
          bookingReq.status === "pending" && bookingReq.sessionType !== "group"
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first
    if (bookingRequests.length === 0) {
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

        {bookingRequests.map((booking) => {
          const sessionStatus = getSessionStatus(
            booking.date,
            booking.startTime,
            booking.endTime
          );
          return (
            <div
              key={booking._id}
              className="rounded-lg border border-[#3b2762]"
            >
              <div className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          `${BASE_URL}/uploads/${booking.tutor?.profileImage}` ||
                          "/placeholder.svg?height=40&width=40"
                        }
                        alt={booking.tutor?.name || "Tutor"}
                      />
                      <AvatarFallback>
                        {booking.tutor?.name
                          ? booking.tutor.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()
                          : "ST"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {booking.topic} with {booking.tutor?.name || "Student"}{" "}
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
                    <AlertDialog
                      open={
                        declineDialogOpen && currentBookingId === booking._id
                      }
                      onOpenChange={(open) => {
                        if (!open) {
                          setDeclineDialogOpen(false);
                          setDeclineReason("");
                        }
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCancelDialog(booking._id)}
                        >
                          <X className="mr-2 h-3 w-3" />
                          Cancel Booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            cancel the booking request.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="reason">
                              Reason for cancellation
                            </Label>
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
                            {isDeclining
                              ? "Cancelling..."
                              : "Confirm Cancellation"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

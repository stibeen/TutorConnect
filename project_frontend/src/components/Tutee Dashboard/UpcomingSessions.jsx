import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarClock, Video, MapPin, Copy } from "lucide-react";
import { convert24to12 } from "../../utils/timeUtils";
import { CustomTooltip } from "../CustomTooltip";
import { format, parse, isBefore, isAfter, addMinutes } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function UpcomingSessions({ bookings: localBookings, groupBookings }) {
  const { user } = useAuth();

  // const [localBookings, setLocalBookings] = useState(bookings);
  // const [groupBookings, setGroupBookings] = useState([]);

  // Add this useEffect hook for polling
  // useEffect(() => {
  //   let isMounted = true;
  //   const pollingInterval = 30000; // 30 seconds

  //   const fetchAllBookings = async () => {
  //     try {
  //       await Promise.all([fetchBookings(), user?.id && fetchGroupBookings()]);
  //     } catch (error) {
  //       console.error("Error fetching bookings in polling:", error);
  //       if (isMounted) {
  //         toast.error("Failed to update bookings");
  //       }
  //     }
  //   };

  //   // Initial fetch
  //   if (user?.id) {
  //     fetchAllBookings();
  //   }

  //   // Set up polling interval
  //   const interval = setInterval(() => {
  //     if (user?.id) {
  //       fetchAllBookings();
  //     }
  //   }, pollingInterval);

  //   // Cleanup function
  //   return () => {
  //     isMounted = false;
  //     clearInterval(interval);
  //   };
  // }, [user?.id]); // Add user.id dependency
  // let isMounted = true;

  // useEffect(() => {
  //   if (user?.id) {
  //     fetchGroupBookings();
  //   }
  // }, [user]);

  // const fetchBookings = async () => {
  //   try {
  //     const response = await axios.get(
  //       "http://localhost:5000/api/bookings/my-bookings",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );

  //     setLocalBookings(response.data);
  //   } catch (error) {
  //     console.error("Error fetching bookings:", error);
  //     throw error; // Re-throw to handle in handleRefresh
  //   }
  // };

  // const fetchGroupBookings = async () => {
  //   try {
  //     console.log("Fetching group bookings for user:", user?.id);

  //     const response = await axios.get(
  //       `http://localhost:5000/api/group-sessions/student/my-group-sessions`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("API Response:", response.data);

  //     if (response.data) {
  //       setGroupBookings(response.data);
  //     }
  //   } catch (error) {
  //     console.error("Unable to fetch group bookings:", error);
  //     throw error; // Re-throw to handle in handleRefresh
  //   }
  // };

  // // Add another useEffect to log when groupBookings actually updates
  // useEffect(() => {
  //   console.log("Group bookings updated:", groupBookings);
  // }, [groupBookings]);

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

  // Function to get badge variant based on status
  const getBadgeVariant = (status) => {
    switch (status) {
      case "confirmed":
        return {
          className:
            "bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700",
          text: "Confirmed",
        };
      case "pending":
        return {
          className:
            "bg-yellow-50 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-700",
          text: "Pending",
        };
      case "cancelled":
        return {
          className:
            "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700",
          text: "Cancelled",
        };
      case "completed":
        return {
          className:
            "bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700",
          text: "Completed",
        };
      default:
        return {
          className:
            "bg-gray-50 text-gray-700 hover:bg-gray-50 hover:text-gray-700",
          text: status,
        };
    }
  };

  // const upcomingBookings = bookings.filter((b) => b.status === "confirmed");
  const confirmedBookingsIndividual = localBookings.filter(
    (b) => b.status === "confirmed" && b.sessionType !== "group"
  );

  const groupBookingsUpcoming = groupBookings
    .filter(
      (groupBooking) =>
        groupBooking.status === "pending" || groupBooking.status === "confirmed"
    )
    .map((groupBooking) => ({
      ...groupBooking,
      sessionType: "group",
      // Add any other properties you need for consistent display
    }));

  const allUpcomingSessions = [
    ...confirmedBookingsIndividual,
    ...groupBookingsUpcoming,
  ];

  if (allUpcomingSessions.length === 0) {
    return <div className="text-center py-8">No upcoming bookings</div>;
  }
  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
      {allUpcomingSessions.map((booking, index) => {
        const badgeInfo = getBadgeVariant(booking.status);
        const sessionStatus = getSessionStatus(
          booking.date,
          booking.startTime,
          booking.endTime
        );
        return (
          <div
            key={index}
            className="flex items-center gap-4 rounded-lg border p-3"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      `${BASE_URL}/uploads/${booking.tutor?.profileImage}` ||
                      "/placeholder.svg?height=32&width=32"
                    }
                    alt={booking.tutor?.name || "Tutor"}
                  />
                  <AvatarFallback>
                    {booking.tutor?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "T"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {booking.topic} with {booking.tutor?.name || "Tutor"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
            <div className="flex items-center gap-2">
              {sessionStatus.status === "ended" && (
                <CustomTooltip
                  content="Waiting for tutor's confirmation to complete this session"
                  position="left"
                >
                  <Badge
                    variant="outline"
                    className="ml-2 bg-gray-100 text-gray-600"
                  >
                    Past
                  </Badge>
                </CustomTooltip>
              )}
              {booking.modality === "online" && booking.meetingLink && (
                <CustomTooltip
                  content={
                    sessionStatus.active
                      ? "Click to join the session now"
                      : sessionStatus.status === "ended"
                      ? "The session has already passed"
                      : `Session will be available 15 min. before the scheduled time`
                  }
                  position="left"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className={`border ${
                      sessionStatus.active
                        ? "bg-[#3b2762] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    disabled={!sessionStatus.active}
                    onClick={() => window.open(booking.meetingLink, "_blank")}
                  >
                    <Video
                      className={`mr-2 h-3 w-3 ${
                        sessionStatus.active
                          ? "text-[#efc940]"
                          : "text-gray-500"
                      }`}
                    />
                    Join
                  </Button>
                </CustomTooltip>
              )}
              {booking.status === "confirmed" &&
                booking.modality === "face-to-face" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-[#3b2762] text-white hover:bg-[#25193e] hover:text-white"
                      >
                        <MapPin className="mr-2 h-3 w-3 text-[#efc940]" />
                        Location
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 p-0 border-[#3b2762] shadow-lg"
                      style={{ borderWidth: "2px" }}
                    >
                      <div className="bg-[#3b2762] p-3">
                        <h4 className="font-semibold text-[#efc940] flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>Meeting Spot</span>
                        </h4>
                      </div>

                      <div className="p-3 space-y-3">
                        <div className="p-3 bg-[#f8f5ff] rounded-lg border border-[#e5dcff]">
                          <p className="text-sm text-[#3b2762] whitespace-pre-line">
                            {booking.locationDetails}
                          </p>
                        </div>

                        <div className="space-y-1 text-xs text-[#3b2762]/90">
                          <p className="flex items-center gap-1">
                            <span className="text-[#efc940]">•</span> Bring your
                            student ID
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="text-[#efc940]">•</span> Arrive 5
                            minutes early
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#3b2762] text-[#3b2762] hover:bg-[#3b2762]/10 hover:text-[#3b2762]"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              booking.locationDetails
                            )
                          }
                        >
                          <Copy className="h-3 w-3 mr-2 text-[#efc940]" />
                          Copy Details
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, Clock, Users, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import TopicSelection from "./TopicSelection";
import ModalitySelection from "./ModalitySelection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { convert24to12 } from "../../utils/timeUtils";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const modalities = [
  { value: "face-to-face", label: "Face-to-Face" },
  { value: "online", label: "Online Meeting" },
];

export function BookingCalendar() {
  const { tutorId } = useParams();
  const { user } = useAuth(); // Get current user from auth context

  const [tutor, setTutor] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [date, setDate] = useState(getTomorrow());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [specificTopic, setSpecificTopic] = useState(""); // NEW: Specific topic input
  const [selectedModality, setSelectedModality] = useState("online");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [cancelledGroupTimes, setCancelledGroupTimes] = useState([]);
  const [groupSessions, setGroupSessions] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    time: false,
    topic: false,
    specificTopic: false, // NEW: Validation for specific topic
  });
  const [isGroupSessionLocked, setIsGroupSessionLocked] = useState(false);
  // Add this state
  const [pricing, setPricing] = useState({
    individualSessionPrice: 30.0,
    groupSessionPrice: 15.0,
    currency: "PHP",
  });
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
          individualSessionPrice: 30.0,
          groupSessionPrice: 15.0,
          currency: "PHP",
        });
      }
    };
    fetchPricing();
  }, []);

  // Reset modality to online when date changes to avoid face-to-face for group sessions
  useEffect(() => {
    if (selectedTime && groupSessions[selectedTime]) {
      setSelectedModality("online");
    }
  }, [date, selectedTime, groupSessions]);

  // NEW: Reset specific topic when main topic changes or when group session is locked
  useEffect(() => {
    if (isGroupSessionLocked || !selectedTopic) {
      setSpecificTopic("");
    }
  }, [selectedTopic, isGroupSessionLocked]);

  useEffect(() => {
    let isMounted = true;
    const pollingInterval = 30000;

    const fetchTutor = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/tutors/${tutorId}`, {
          withCredentials: true, // If you need cookies/auth
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // If authentication required
          },
        });
        if (isMounted) {
          setTutor(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch tutor data:", error);
        if (isMounted) {
          toast.error("Failed to update bookings");
        }
      }
    };

    fetchTutor();
    const interval = setInterval(fetchTutor, pollingInterval);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tutorId]);

  // Fetch availability and group sessions when date changes
  useEffect(() => {
    if (date && tutor?._id) {
      fetchAvailability();
      fetchGroupSessions();
    }
  }, [date, tutor?._id]);

  // Handle time selection to lock fields for existing group sessions
  useEffect(() => {
    if (selectedTime && groupSessions[selectedTime]) {
      // This is an existing group session, lock the fields
      const groupSession = groupSessions[selectedTime];

      setIsGroupSessionLocked(true);

      // Set the modality from the group session data (not forced to online)
      if (groupSession.modality) {
        setSelectedModality(groupSession.modality);
      }

      // Set the topic directly from group session using a special identifier
      if (groupSession.topic) {
        // Use a special format to indicate it's from a group session
        setSelectedTopic(`group-session-${groupSession._id}`);
      }
    } else {
      // Not a group session or no time selected, unlock fields
      setIsGroupSessionLocked(false);
      // Reset topic if it was a group session topic
      if (selectedTopic && selectedTopic.startsWith("group-session-")) {
        setSelectedTopic("");
      }
    }
  }, [selectedTime, groupSessions]);

  const fetchAvailability = async () => {
    try {
      setLoadingAvailability(true);
      const response = await axios.get(
        `${BASE_URL}/api/bookings/availability`,
        {
          params: {
            tutorId: tutor._id,
            date: date,
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        setAvailableSlots(response.data?.available || []);
        setBookedSlots(response.data?.booked || []);
        setCancelledGroupTimes(response.data?.cancelledGroupTimes || []);
      }

      if (selectedTime && response.data?.booked?.includes(selectedTime)) {
        setSelectedTime("");
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      toast.error("Failed to check availability");
      setAvailableSlots([]);
      setBookedSlots([]);
      setCancelledGroupTimes([]);
    } finally {
      setLoadingAvailability(false);
    }
  };

  const fetchGroupSessions = async () => {
    try {
      if (!tutor?._id || !date) return;

      // Format date as YYYY-MM-DD for the API
      const formattedDate = date.toISOString();

      const response = await axios.get(
        `${BASE_URL}/api/group-sessions/availability`,
        {
          params: {
            tutorId: tutor._id,
            date: formattedDate,
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setGroupSessions(response.data);
      console.log("Group sessions:", groupSessions);
    } catch (error) {
      console.error("Failed to fetch group sessions:", error);
      setGroupSessions({});
    }
  };

  const resetForm = () => {
    setSelectedTime("");
    setSelectedTopic("");
    setSpecificTopic(""); // NEW: Reset specific topic
    setSelectedModality("online");
    setIsGroupSessionLocked(false);
    setDate(getTomorrow());
    setValidationErrors({ time: false, topic: false, specificTopic: false });
    setDialogOpen(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTime || !selectedTopic) {
      toast.error(
        "Please select time, subject, and specify the topic to tackle"
      );
      return;
    }

    try {
      // Determine session type based on whether it's a group session
      const isGroupSession = !!groupSessions[selectedTime];
      const sessionType = isGroupSession ? "group" : "individual";

      // NEW: Combine main topic with specific topic
      const mainTopic = getSelectedTopicLabel();
      const fullTopic = `${mainTopic} - ${specificTopic.trim()}`;

      const bookingData = {
        tutorId: tutor._id,
        date: date.toISOString(),
        formattedDate: date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        startTime: selectedTime,
        endTime: `${parseInt(selectedTime.split(":")[0]) + 1}:${
          selectedTime.split(":")[1]
        }`,
        topic: fullTopic, // NEW: Use combined topic
        modality: selectedModality,
        sessionType: sessionType,
        price: getSessionPrice(sessionType),
      };

      // Use different endpoint for group bookings
      const endpoint =
        sessionType === "group"
          ? `${BASE_URL}/api/group-sessions/groupSessionBooking`
          : `${BASE_URL}/api/bookings`;
      const token = localStorage.getItem("token");
      const response = await axios.post(endpoint, bookingData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setDialogOpen(false);

      if (sessionType === "group") {
        toast.success("Joined group session successfully!");
      } else {
        toast.success("Booking created successfully!");
      }

      // Refresh both availability and group sessions after booking
      await Promise.all([fetchAvailability(), fetchGroupSessions()]);

      resetForm();
    } catch (error) {
      // Handle specific error messages better
      if (error.response?.status === 409) {
        const errorMessage =
          error.response.data.message || error.response.data.error;
        toast.error(errorMessage);

        // Refresh data to get current state
        await Promise.all([fetchAvailability(), fetchGroupSessions()]);
      } else if (error.response?.data?.error.includes("past dates")) {
        setDate(new Date());
        toast.error("Cannot book in the past");
      } else {
        console.error("Booking failed:", error);
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Booking failed";
        toast.error(errorMessage);
      }
    }
  };

  const handleBookSession = () => {
    const errors = {
      time: !selectedTime,
      topic: !selectedTopic,
      specificTopic: !isGroupSessionLocked && !specificTopic.trim(), // Only validate for individual sessions
    };

    setValidationErrors(errors);

    if (!errors.time && !errors.topic && !errors.specificTopic) {
      setDialogOpen(true);
    } else {
      toast.error(
        isGroupSessionLocked
          ? "Please select a time and subject"
          : "Please fill in all required fields"
      );
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setValidationErrors((prev) => ({ ...prev, time: false }));
  };

  const handleTopicSelect = (topic) => {
    if (!isGroupSessionLocked) {
      setSelectedTopic(topic);
      setValidationErrors((prev) => ({ ...prev, topic: false }));
    }
  };

  // NEW: Handle specific topic input change
  const handleSpecificTopicChange = (e) => {
    if (!isGroupSessionLocked) {
      setSpecificTopic(e.target.value);
      setValidationErrors((prev) => ({ ...prev, specificTopic: false }));
    }
  };

  const handleDateSelect = (newDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate < today) {
      toast.error("Cannot book in the past");
      return;
    }

    setDate(newDate);
    setSelectedTime("");
    setIsGroupSessionLocked(false);
  };

  // Get available time slots with booking status and group info
  const getAvailableTimeSlots = () => {
    if (!date || !tutor?.schedule || loadingAvailability) return [];

    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    const daySchedule = tutor.schedule[dayOfWeek] || [];

    return daySchedule
      .map((time) => {
        // Convert 12-hour format to 24-hour format for matching with group sessions
        const slot24Hour = convertTo24Hour(time);

        // Check if there's a group session for this time slot
        const groupSession = groupSessions[slot24Hour];
        const hasGroupSession = !!groupSession;

        // For group sessions, check if there are available spots
        const groupSpotsAvailable = hasGroupSession
          ? groupSession.maxParticipants - groupSession.currentParticipants
          : 0;

        const isGroupSessionFull = hasGroupSession && groupSpotsAvailable <= 0;

        // Regular individual booking check (exclude group sessions from this)
        const isIndividualBooked =
          bookedSlots.includes(slot24Hour) && !hasGroupSession;
        const isTooSoon = isWithin24Hours(date, slot24Hour);

        // Check if this is a tutor-cancelled group session
        const isTutorCancelled =
          Array.isArray(cancelledGroupTimes) &&
          cancelledGroupTimes.includes(slot24Hour);

        // A slot is disabled if:
        // - It's individually booked AND doesn't have a group session
        // - It's too soon to book
        // - It's a group session that's full
        // - It's a tutor-cancelled group session
        const disabled =
          isIndividualBooked ||
          isTooSoon ||
          isGroupSessionFull ||
          isTutorCancelled;

        return {
          displayTime: time, // Original 12-hour format for display
          value: slot24Hour, // 24-hour format for internal use
          disabled,
          isBooked: isIndividualBooked,
          isTooSoon,
          hasGroupSession,
          groupSpotsAvailable,
          groupSessionId: groupSession?._id,
          isGroupSessionFull,
          isTutorCancelled,
          groupSessionData: groupSession,
        };
      })
      .sort((a, b) => a.value.localeCompare(b.value));
  };

  const timeSlots = getAvailableTimeSlots();

  const getSelectedTopicLabel = () => {
    if (!selectedTopic) return "Not selected";

    // If it's a group session topic, get it directly from groupSessions
    if (
      selectedTopic.startsWith("group-session-") &&
      selectedTime &&
      groupSessions[selectedTime]
    ) {
      return groupSessions[selectedTime].topic || "Not selected";
    }

    // Regular topic from tutor's expertise
    const topic = tutor?.expertise?.find(
      (_, index) => `topic-${index}` === selectedTopic
    );
    return topic || "Not selected";
  };

  const getSelectedModalityLabel = () => {
    const modality = modalities.find((m) => m.value === selectedModality);
    return modality ? modality.label : "Not selected";
  };

  const getSessionPrice = (sessionType) => {
    return sessionType === "group" 
    ? pricing.groupSessionPrice 
    : pricing.individualSessionPrice;
  };

  const getSelectedSessionTypeLabel = () => {
    const isGroupSession = selectedTime && groupSessions[selectedTime];
    return isGroupSession ? "Group Session" : "Individual Session";
  };

  // NEW: Get full topic for display (main topic + specific topic)
  const getFullTopicLabel = () => {
    const mainTopic = getSelectedTopicLabel();
    if (specificTopic) {
      return `${mainTopic} - ${specificTopic}`;
    }
    return mainTopic;
  };

  const isFormComplete = (() => {
    // Must have time and main topic selected
    if (!selectedTime || !selectedTopic) return false;

    // For group sessions, no specific topic needed
    if (isGroupSessionLocked) return true;

    // For individual sessions, specific topic is required
    return specificTopic.trim().length > 0;
  })();

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="border rounded-md"
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date < today;
          }}
          modifiers={{
            past: { before: new Date() },
            today: {
              from: new Date(new Date().setHours(0, 0, 0, 0)),
              to: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          }}
          modifiersStyles={{
            past: {
              color: "#ccc",
              textDecoration: "line-through",
            },
            today: {
              color: "#ccc",
              textDecoration: "line-through",
            },
          }}
          footer={
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Earliest available date: {getTomorrow().toLocaleDateString()}
            </p>
          }
        />

        <Separator orientation="vertical" className="hidden md:block" />
        <Separator className="md:hidden" />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">Available Time Slots</h3>
            {loadingAvailability && (
              <span className="text-sm text-muted-foreground">
                (Loading...)
              </span>
            )}
          </div>

          {timeSlots.length > 0 ? (
            <RadioGroup
              value={selectedTime || ""}
              onValueChange={handleTimeSelect}
            >
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <Label
                    key={slot.value}
                    htmlFor={slot.value}
                    className={cn(
                      "flex items-center justify-center rounded-md border p-2 relative",
                      slot.disabled
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-accent hover:text-accent-foreground",
                      selectedTime === slot.value && "border-primary",
                      slot.isBooked &&
                        "bg-gray-100 border-gray-300 text-gray-500",
                      slot.hasGroupSession &&
                        !slot.disabled &&
                        "bg-blue-50 border-blue-200",
                      slot.isTutorCancelled &&
                        "bg-red-50 border-red-200 text-red-500"
                    )}
                  >
                    <RadioGroupItem
                      value={slot.value}
                      id={slot.value}
                      className="sr-only"
                      disabled={slot.disabled}
                    />
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{slot.displayTime}</span>

                    {slot.isBooked && (
                      <span className="absolute -top-2 -right-1 bg-gray-500 text-white text-xs px-1 rounded">
                        Booked
                      </span>
                    )}

                    {slot.isTooSoon && !slot.isBooked && (
                      <span className="absolute -top-2 -right-1 bg-orange-500 text-white text-xs px-1 rounded">
                        Too soon
                      </span>
                    )}

                    {slot.hasGroupSession &&
                      !slot.isBooked &&
                      !slot.isTooSoon &&
                      !slot.isTutorCancelled && (
                        <span className="absolute -top-2 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                          {slot.groupSpotsAvailable} slot
                          {slot.groupSpotsAvailable !== 1 ? "s" : ""}
                        </span>
                      )}

                    {slot.isGroupSessionFull && (
                      <span className="absolute -top-2 -right-1 bg-gray-500 text-white text-xs px-1 rounded">
                        Full
                      </span>
                    )}

                    {slot.isTutorCancelled && (
                      <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs px-1 rounded">
                        Booking Rejected
                      </span>
                    )}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          ) : (
            <div className="text-sm text-muted-foreground">
              {loadingAvailability
                ? "Checking availability..."
                : "No available time slots for this day"}
            </div>
          )}
        </div>
      </div>

      {validationErrors.time && (
        <p className="text-sm text-red-500 mt-1">Please select a time slot</p>
      )}

      <Separator orientation="horizontal" className="hidden md:block" />
      <Separator className="md:hidden" />

      <div className="space-y-6">
        {/* Group session info - Show when a group session time is selected */}
        {selectedTime && groupSessions[selectedTime] && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Users className="h-4 w-4" />
              <span className="font-medium">Group Session</span>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-blue-700 mt-1">
              You're joining an existing group session. Session details are
              locked to match the group.
            </p>
            <div className="mt-2 text-xs text-blue-600 space-y-1">
              <p>
                • {groupSessions[selectedTime].currentParticipants} of{" "}
                {groupSessions[selectedTime].maxParticipants} spots filled
              </p>
              <p>
                • Modality:{" "}
                {groupSessions[selectedTime].modality === "online"
                  ? "Online"
                  : "Face-to-Face"}
              </p>
              <p>• Topic and modality are preset for this group</p>
            </div>
          </div>
        )}

        <TopicSelection
          tutor={tutor}
          selectedTopic={selectedTopic}
          onTopicChange={handleTopicSelect}
          hasError={validationErrors.topic}
          disabled={isGroupSessionLocked}
          isGroupSession={isGroupSessionLocked} // NEW: Pass this prop
          groupSessionTopic={
            // NEW: Pass the group session topic
            isGroupSessionLocked && selectedTime && groupSessions[selectedTime]
              ? groupSessions[selectedTime].topic
              : ""
          }
        />

        {validationErrors.topic && (
          <p className="text-sm text-red-500 -mt-4">Please select a subject</p>
        )}

        {/* NEW: Specific Topic Input Field - Now Mandatory */}
        {selectedTopic && !isGroupSessionLocked && (
          <div className="space-y-2">
            <Label htmlFor="specific-topic" className="text-sm font-medium">
              Specific Topic to Tackle <span className="text-red-500">*</span>
            </Label>
            <input
              id="specific-topic"
              type="text"
              placeholder="e.g., variable declaration and calling, loops and arrays, inheritance, etc."
              value={specificTopic}
              onChange={handleSpecificTopicChange}
              disabled={isGroupSessionLocked}
              className={cn(
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed",
                validationErrors.specificTopic
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              )}
            />
            {validationErrors.specificTopic && (
              <p className="text-sm text-red-500">
                Please specify the topic you want to tackle
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Specify the particular concepts or areas you'd like to focus on
              during the 1-hour session
            </p>
          </div>
        )}

        <ModalitySelection
          selectedModality={selectedModality}
          onModalityChange={(value) => {
            if (!isGroupSessionLocked) {
              setSelectedModality(value);
            }
          }}
          disabled={isGroupSessionLocked}
          // Optional: Add these props if you want to show the group session modality like we did with topics
          isGroupSession={isGroupSessionLocked}
          groupSessionModality={
            isGroupSessionLocked && selectedTime && groupSessions[selectedTime]
              ? groupSessions[selectedTime].modality
              : ""
          }
        />
      </div>

      {/* Session Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Session Summary</div>
              <div className="text-sm text-muted-foreground">60 minutes</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Date</div>
              <div className="text-sm font-medium">
                {date?.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Time</div>
              <div className="text-sm font-medium">
                {selectedTime
                  ? `${convert24to12(selectedTime)} - ${convert24to12(
                      `${parseInt(selectedTime.split(":")[0]) + 1}:${
                        selectedTime.split(":")[1]
                      }`
                    )}`
                  : "Not selected"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Session Type</div>
              <div className="text-sm font-medium">
                {getSelectedSessionTypeLabel()}
              </div>
            </div>
            {selectedTime && groupSessions[selectedTime] && (
              <div className="flex items-center justify-between">
                <div className="text-sm">Group Size</div>
                <div className="text-sm font-medium">
                  {groupSessions[selectedTime].currentParticipants + 1} of{" "}
                  {groupSessions[selectedTime].maxParticipants}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-sm">Subject</div>
              <div className="text-sm font-medium">
                {getFullTopicLabel()}{" "}
                {/* NEW: Use full topic with specific topic */}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">Modality</div>
              <div className="text-sm font-medium">
                {getSelectedModalityLabel()}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="font-medium">Total</div>
              <div className="font-bold">
                ₱
                {getSessionPrice(
                  selectedTime && groupSessions[selectedTime]
                    ? "group"
                    : "individual"
                ).toFixed(2)}
              </div>
            </div>
            <Button
              className="w-full mt-2"
              onClick={handleBookSession}
              disabled={!isFormComplete || loadingAvailability}
            >
              {loadingAvailability
                ? "Checking Availability..."
                : selectedTime && groupSessions[selectedTime]
                ? "Join Group Session"
                : "Book Session"}
            </Button>

            {!isFormComplete && !loadingAvailability && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {isGroupSessionLocked
                  ? "Please select a time and subject to book"
                  : "Please select a time, subject, and specify the topic to book"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTime && groupSessions[selectedTime]
                ? "Confirm Group Booking"
                : "Confirm Booking"}
            </DialogTitle>
            <DialogDescription>
              {selectedTime && groupSessions[selectedTime]
                ? "You're joining a group session. Please review details below."
                : "Please review booking details"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Session Summary</div>
                  <div className="text-sm text-muted-foreground">
                    60 minutes
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Date</div>
                  <div className="text-sm font-medium">
                    {date?.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Time</div>
                  <div className="text-sm font-medium">
                    {selectedTime
                      ? `${convert24to12(selectedTime)} - ${convert24to12(
                          `${parseInt(selectedTime.split(":")[0]) + 1}:${
                            selectedTime.split(":")[1]
                          }`
                        )}`
                      : "Not selected"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Session Type</div>
                  <div className="text-sm font-medium">
                    {getSelectedSessionTypeLabel()}
                  </div>
                </div>
                {selectedTime && groupSessions[selectedTime] && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm">Group Size</div>
                    <div className="text-sm font-medium">
                      {groupSessions[selectedTime].currentParticipants + 1} of{" "}
                      {groupSessions[selectedTime].maxParticipants}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-sm">Subject</div>
                  <div className="text-sm font-medium">
                    {getFullTopicLabel()}{" "}
                    {/* NEW: Use full topic with specific topic */}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">Modality</div>
                  <div className="text-sm font-medium">
                    {getSelectedModalityLabel()}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="font-medium">Total</div>
                  <div className="font-bold">
                    ₱
                    {getSessionPrice(
                      selectedTime && groupSessions[selectedTime]
                        ? "group"
                        : "individual"
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmBooking}>
                {selectedTime && groupSessions[selectedTime]
                  ? "Join Group"
                  : "Confirm Booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

function isWithin24Hours(selectedDate, timeSlot) {
  const now = new Date();
  const bookingDateTime = new Date(selectedDate);
  const [hours, minutes] = timeSlot.split(":").map(Number);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  const diffMs = bookingDateTime - now;
  return diffMs < 24 * 60 * 60 * 1000;
}

// Helper function to convert 12-hour to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h) return time12h;

  const [timePart, period] = time12h.split(" ");
  if (!period) return time12h; // Already in 24-hour format

  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

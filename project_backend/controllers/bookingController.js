const Booking = require("../models/Booking");
const Tutor = require("../models/Tutor");
const GroupSession = require("../models/GroupSession");
const User = require("../models/User");
const mongoose = require("mongoose");
const NotificationService = require("../services/notificationService");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("tutor", "name email profileImage profileImage2") // Add this line
      .populate("student", "name email"); // And this line
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Create a new booking
const createBooking = async (req, res) => {
  try {
    const bookingDate = new Date(req.body.date);
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Minimum time before session (changed from 30 minutes to 24 hours)
    const twentyFourHoursBefore = bookingDate.getTime() - 24 * 60 * 60000;
    if (now > twentyFourHoursBefore) {
      return res.status(400).json({
        error:
          "To give tutors enough time to prepare. Rush booking is not allowed.",
        cutoffTime: new Date(twentyFourHoursBefore),
        currentTime: now,
      });
    }
    console.log("Incoming booking data:", req.body);
    console.log("Authenticated user:", req.user);

    const {
      tutorId,
      date,
      formattedDate,
      startTime,
      endTime,
      topic,
      modality,
      sessionType,
      price,
    } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (
      !tutorId ||
      !date ||
      !startTime ||
      !topic ||
      !modality ||
      !sessionType ||
      price === undefined
    ) {
      console.log("Missing fields:", {
        tutorId,
        date,
        startTime,
        topic,
        modality,
        sessionType,
        price,
      });
      return res.status(400).json({
        error: "Missing required fields",
        missing: {
          tutorId: !tutorId,
          date: !date,
          startTime: !startTime,
          topic: !topic,
          modality: !modality,
          sessionType: !sessionType,
          price: price === undefined,
        },
      });
    }

    // Check if tutor exists
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    // Validate tutor's schedule availability
    const bookingDateObj = new Date(date);
    const dayOfWeek = bookingDateObj.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Parse the start time to compare with tutor's schedule
    const [hourStr, minuteStr] = startTime.split(":");
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);

    // Convert to 12-hour format for comparison (assuming tutor schedule is in 12-hour format)
    let displayTime = startTime;
    if (hour === 0) {
      displayTime = `12:${minuteStr.padStart(2, "0")} AM`;
    } else if (hour < 12) {
      displayTime = `${hour}:${minuteStr.padStart(2, "0")} AM`;
    } else if (hour === 12) {
      displayTime = `12:${minuteStr.padStart(2, "0")} PM`;
    } else {
      displayTime = `${hour - 12}:${minuteStr.padStart(2, "0")} PM`;
    }

    // Check if the time slot is in tutor's schedule
    const tutorScheduleForDay = tutor.schedule[dayOfWeek] || [];
    const isTimeAvailable = tutorScheduleForDay.some((scheduledTime) => {
      // Handle different time formats
      const normalizedScheduledTime = scheduledTime.replace(/\s+/g, " ").trim();
      const normalizedDisplayTime = displayTime.replace(/\s+/g, " ").trim();
      return (
        normalizedScheduledTime === normalizedDisplayTime ||
        normalizedScheduledTime === startTime
      );
    });

    if (!isTimeAvailable) {
      return res.status(400).json({
        error: "Time slot not in tutor's schedule",
        availableSlots: tutorScheduleForDay,
        day: dayOfWeek,
        requested: displayTime,
      });
    }

    // **CRITICAL: Check for existing bookings (prevent double booking)**
    const existingBooking = await Booking.findOne({
      tutor: tutorId,
      date: new Date(date),
      startTime: startTime,
      status: { $in: ["pending", "confirmed"] }, // Don't allow if already pending or confirmed
    });

    if (existingBooking) {
      return res.status(409).json({
        error: "Time slot already booked",
        message:
          "This time slot is no longer available. Please select a different time.",
      });
    }

    // **CRITICAL: Check for bookings with same time(prevent booking at the same time with different tutors)**
    const sameTimeBooking = await Booking.findOne({
      student: studentId,
      formattedDate: formattedDate,
      startTime: startTime,
      endTime: endTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (sameTimeBooking) {
      return res.status(409).json({
        error: "Time slot already booked",
        message:
          "You already made a booking to another tutor at this time slot.",
      });
    }

    // **CRITICAL: Check for unpaid bookings**
    const unpaidBookingsCount = await Booking.countDocuments({
      student: studentId,
      status: { $in: ["confirmed", "completed", "pending"] }, // Only count confirmed/completed bookings
      paymentStatus: "pending",
    });

    if (unpaidBookingsCount >= 3) {
      return res.status(409).json({
        error: "You have too many unpaid bookings",
        message: `You cannot book new sessions until you pay for your ${unpaidBookingsCount} unpaid bookings.`,
      });
    }

    // Create the individual booking
    const booking = new Booking({
      student: studentId,
      tutor: tutorId,
      date: new Date(date),
      formattedDate,
      startTime,
      endTime:
        endTime ||
        `${parseInt(startTime.split(":")[0]) + 1}:${startTime.split(":")[1]}`,
      topic,
      modality,
      sessionType,
      price,
      status: "pending",
      // For individual sessions, set group info
      groupSession: {
        isGroup: false,
        maxParticipants: 1,
        currentParticipants: 1,
        participants: [
          {
            student: studentId,
            status: "confirmed",
          },
        ],
      },
    });

    await booking.save();
    // Populate the booking for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("student", "name email")
      .populate("tutor", "name email profileImage2");

    try {
      await NotificationService.createBookingNotification(
        populatedBooking,
        "booking_request"
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
      // Don't fail the booking if notification fails
    }

    res.status(201).json({
      message: "Booking request successful",
      booking: populatedBooking,
    });
  } catch (error) {
    // Handle mongoose validation errors (including pre-save hook errors)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    // Handle other errors
    res.status(400).json({ error: error.message });
  }
};

// Get available time slots for a tutor on a specific date
const checkAvailability = async (req, res) => {
  try {
    const { tutorId, date } = req.query;
    console.log("Checking availability for:", { tutorId, date });

    if (!tutorId || !date) {
      return res.status(400).json({ error: "Tutor ID and date are required" });
    }

    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    const dayOfWeek = new Date(date).toLocaleString("en-US", {
      weekday: "long",
    });
    const availableSlots = tutor.schedule[dayOfWeek] || [];

    // Get individual bookings (non-group sessions)
    const individualBookings = await Booking.find({
      tutor: tutorId,
      date: new Date(date),
      "groupSession.isGroup": false, // Only individual bookings
      $or: [
        { status: { $in: ["pending", "confirmed"] } },
        {
          status: "cancelled",
          timeSlotReleased: { $ne: true },
        },
      ],
    }).select("startTime");

    const individualBookedTimes = individualBookings.map(
      (booking) => booking.startTime
    );

    // Get group sessions to check which ones are full
    const groupSessions = await Booking.find({
      tutor: tutorId,
      date: new Date(date),
      "groupSession.isGroup": true,
      status: { $in: ["pending", "confirmed"] },
    });

    // Find group sessions that are full
    const fullGroupSessions = groupSessions.filter(
      (booking) =>
        booking.groupSession.currentParticipants >=
        booking.groupSession.maxParticipants
    );

    const fullGroupTimes = fullGroupSessions.map(
      (booking) => booking.startTime
    );

    // NEW: Get cancelled group sessions (tutor-cancelled)
    const cancelledGroupSessions = await Booking.find({
      tutor: tutorId,
      date: new Date(date),
      "groupSession.isGroup": true,
      status: "cancelled",
      cancelledBy: "tutor", // Only tutor-cancelled sessions
    }).select("startTime");

    const cancelledGroupTimes = cancelledGroupSessions.map(
      (booking) => booking.startTime
    );

    // Combine individual booked times, full group session times, AND cancelled group times
    const allBookedTimes = [
      ...individualBookedTimes,
      ...fullGroupTimes,
      ...cancelledGroupTimes,
    ];

    // Filter out booked slots from available slots
    const available = availableSlots.filter((slot) => {
      // Convert slot to 24-hour format for comparison
      const [timePart, period] = slot.includes(" ")
        ? slot.split(" ")
        : [slot, "AM"];
      const [hoursStr, minutesStr] = timePart.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr || "0", 10);

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const slot24Hour = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      return !allBookedTimes.includes(slot24Hour);
    });

    const responseData = {
      available,
      booked: allBookedTimes,
      cancelledGroupTimes, // NEW: Send cancelled group times separately
      totalSlots: availableSlots.length,
      availableSlots: available.length,
    };

    console.log("Sending response:", responseData);
    res.json(responseData);
  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// Get bookings for current user
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const bookings = await Booking.find({
      $or: [{ student: userId }, { tutor: userId }],
    })
      .populate("student", "name email profileImage avatar") // Include both profileImage and avatar
      .populate("tutor", "name email profileImage profileImage2 avatar") // Include both profileImage and avatar
      .populate(
        "groupSession.participants.student",
        "name email profileImage avatar"
      )
      .sort({ date: 1, startTime: 1 });

    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const { id: bookingId } = req.params;
    const userId = req.user._id;
    const now = new Date();

    const booking = await Booking.findById(bookingId)
      .populate("student", "name email")
      .populate("tutor", "name email profileImage2");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify user is either the student or tutor
    const isStudent = booking.student._id.equals(userId);
    const isTutor = booking.tutor._id.equals(userId);

    if (!isStudent && !isTutor) {
      return res.status(403).json({
        error: "Only the student or tutor can cancel this booking",
      });
    }

    // Check if booking can be cancelled (not already completed or cancelled)
    if (booking.status === "completed") {
      return res.status(400).json({
        error: "Completed bookings cannot be cancelled",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        error: "Booking is already cancelled",
      });
    }

    // Calculate if booking is at least 24 hours in the future
    const bookingDateTime = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(":");
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const isMoreThan24Hours = bookingDateTime - now > twentyFourHoursInMs;

    // Increment tutor's cancellation count if they cancel within 24 hours
    if (
      isTutor &&
      !isMoreThan24Hours &&
      booking.status === "confirmed" &&
      reason !== `Student didn't show up`
      // ||
      // (!isMoreThan24Hours && booking.status === "confirmed")
    ) {
      // Increment cancellation count and check if tutor should be deactivated
      const updatedTutor = await Tutor.findByIdAndUpdate(
        userId,
        {
          $inc: { onDayCancellationCount: 1 },
        },
        { new: true } // This returns the updated document
      );

      // Check if cancellation count is >= 3 and deactivate tutor
      if (updatedTutor.onDayCancellationCount >= 3) {
        await Tutor.findByIdAndUpdate(userId, {
          $set: { isActive: false },
        });
      }
    }
    // Update booking status
    booking.isPayable =
      (isStudent || (isTutor && reason === `Student didn't show up`)) &&
      !isMoreThan24Hours &&
      booking.status === "confirmed";
    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = isStudent ? "student" : "tutor";
    booking.cancelledAt = new Date();
    // Add a flag to indicate if the time slot should be available
    booking.timeSlotReleased = isStudent && isMoreThan24Hours;

    await booking.save();
    try {
      await NotificationService.createBookingNotification(
        booking,
        "booking_cancelled",
        {
          cancelledBy: booking.cancelledBy,
          reason: booking.cancellationReason,
        }
      );
    } catch (notificationError) {
      console.error(
        "Failed to send cancellation notification:",
        notificationError
      );
    }
    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        cancelledBy: booking.cancelledBy,
        reason: booking.cancellationReason,
        timeSlotAvailable: booking.timeSlotReleased,
        cancelledAt: booking.cancelledAt,
      },
    });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({
      error: "Failed to cancel booking",
      details: error.message,
    });
  }
};

const confirmBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { meetingLink, locationDetails, specialInstructions } = req.body;
    const userId = req.user._id;
    const now = new Date();

    const confirmedDateTime = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (!bookingId) {
      console.error("Missing booking ID");
      return res.status(400).json({ error: "Booking ID is required" });
    }

    // Find the booking with populated data
    const booking = await Booking.findById(bookingId)
      .populate("student", "name email")
      .populate("tutor", "name email");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify user is the tutor for this booking
    if (!booking.tutor._id.equals(userId)) {
      return res.status(403).json({
        error: "Only the tutor can confirm this booking",
      });
    }

    // Validate booking status
    if (booking.status !== "pending") {
      return res.status(400).json({
        error: "Only pending bookings can be confirmed",
        currentStatus: booking.status,
      });
    }

    // Time validation - can't confirm past bookings
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(parseInt(booking.startTime.split(":")[0]));
    bookingDate.setMinutes(parseInt(booking.startTime.split(":")[1]));

    if (bookingDate < now) {
      return res.status(400).json({
        error: "Cannot confirm past bookings",
        bookingTime: bookingDate,
        currentTime: now,
      });
    }

    // Minimum time before session (changed from 30 minutes to 24 hours)
    const twentyFourHoursBefore = new Date(
      bookingDate.getTime() - 24 * 60 * 60000
    );
    if (now > twentyFourHoursBefore) {
      return res.status(400).json({
        error: "Cannot confirm within 24 hours of session time",
        cutoffTime: twentyFourHoursBefore,
        currentTime: now,
      });
    }

    // Validate meeting details based on modality
    if (booking.modality === "online") {
      if (!meetingLink) {
        return res.status(400).json({
          error: "Meeting link is required for online sessions",
        });
      }

      const urlPattern =
        /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(\/)?(\?.*)?$/i;
      if (!urlPattern.test(meetingLink)) {
        return res
          .status(400)
          .json({ error: "Please provide a valid meeting URL" });
      }
    } else {
      // face-to-face
      if (!locationDetails || locationDetails.length < 6) {
        return res.status(400).json({
          error:
            "Location details must be at least 10 characters long for face-to-face sessions",
        });
      }
    }

    // Update booking
    booking.status = "confirmed";
    booking.confirmedAt = now;
    booking.confirmedDateTime = confirmedDateTime;
    booking.isPayable = true;
    if (booking.modality === "online") {
      // Only validate and set meetingLink for online
      if (!meetingLink) {
        return res
          .status(400)
          .json({ error: "Meeting link required for online sessions" });
      }
      const urlPattern =
        /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
      if (!urlPattern.test(meetingLink)) {
        return res
          .status(400)
          .json({ error: "Please provide a valid meeting URL" });
      }
      booking.meetingLink = meetingLink;
      booking.locationDetails = undefined; // Clear for online
      booking.specialInstructions = undefined;
    } else {
      // Face-to-face - only validate and set location
      if (!locationDetails || locationDetails.trim().length < 6) {
        return res.status(400).json({
          error: "Location details must be at least 10 characters long",
        });
      }
      booking.locationDetails = locationDetails;
      booking.specialInstructions = specialInstructions;
      booking.meetingLink = undefined; // Clear for face-to-face
    }

    await booking.save();
    try {
      await NotificationService.createBookingNotification(
        booking,
        "booking_confirmed",
        {
          meetingLink: booking.meetingLink,
          locationDetails: booking.locationDetails,
          specialInstructions: booking.specialInstructions,
        }
      );
    } catch (notificationError) {
      console.error(
        "Failed to send confirmation notification:",
        notificationError
      );
    }
    // TODO: Add notification logic here (will implement next)

    res.json({
      success: true,
      message: "Booking confirmed successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        modality: booking.modality,
        meetingLink: booking.meetingLink,
        locationDetails: booking.locationDetails,
        specialInstructions: booking.specialInstructions,
        student: booking.student,
        tutor: booking.tutor,
        date: booking.formattedDate,
        isPayable: booking.isPayable,
      },
    });
  } catch (error) {
    console.error("Detailed validation error:", {
      receivedLocation: req.body.locationDetails,
      length: req.body.locationDetails?.length,
      error: error.message,
    });
    console.error("Detailed confirmation error:", {
      message: error.message,
      stack: error.stack,
      fullError: error,
    });
    res.status(500).json({
      error: "Failed to confirm booking",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const userId = req.user._id;
    const now = new Date();

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    // Find the booking with populated data
    const booking = await Booking.findById(bookingId)
      .populate("student", "name email")
      .populate("tutor", "name email profileImage2");

    if (req.file) {
      booking.proofOfCompletion = req.file.filename; // Or req.file.path if needed
    }
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify user is the tutor for this booking
    if (!booking.tutor._id.equals(userId)) {
      return res.status(403).json({
        error: "Only the tutor can complete this booking",
      });
    }

    // Validate booking status - must be confirmed
    if (booking.status !== "confirmed") {
      return res.status(400).json({
        error: "Only confirmed bookings can be marked as completed",
        currentStatus: booking.status,
      });
    }

    // Time validation - can't complete before session time
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(parseInt(booking.startTime.split(":")[0]));
    bookingDate.setMinutes(parseInt(booking.startTime.split(":")[1]));

    if (bookingDate > now) {
      return res.status(400).json({
        error: "Cannot complete booking before session time",
        bookingTime: bookingDate,
        currentTime: now,
      });
    }

    // Handle file upload if present
    if (req.file) {
      // Here you would typically:
      // 1. Save the file to cloud storage (AWS S3, Google Cloud Storage, etc.)
      // 2. Or save to your server's file system
      // For this example, we'll just store the filename/path

      // Example for local storage:
      // const filePath = `/uploads/proofs/${req.file.filename}`;
      // booking.proofOfCompletion = filePath;

      // For now, we'll just store the original filename
      booking.proofOfCompletion = req.file.filename;

      // const proofFileName = req.file.filename;
    } else {
      return res
        .status(400)
        .json({ error: "Proof of attendance image is required" });
    }

    // Update booking status to completed
    booking.status = "completed";
    booking.completedAt = now;
    // booking.proofOfCompletion = proofFileName
    await booking.save();
    try {
      await NotificationService.createBookingNotification(
        booking,
        "booking_completed",
        {
          proofOfCompletion: booking.proofOfCompletion,
        }
      );
    } catch (notificationError) {
      console.error(
        "Failed to send completion notification:",
        notificationError
      );
    }
    // TODO: Add notification logic here if needed

    res.json({
      success: true,
      message: "Booking marked as completed successfully",
      booking: {
        id: booking._id,
        status: booking.status,
        completedAt: booking.completedAt,
        student: booking.student,
        tutor: booking.tutor,
        date: booking.formattedDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        topic: booking.topic,
        proofOfCompletion: booking.proofOfCompletion,
      },
    });
  } catch (error) {
    console.error("Complete booking error:", {
      message: error.message,
      stack: error.stack,
      fullError: error,
    });
    res.status(500).json({
      error: "Failed to complete booking",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// const submitReview = async (req, res) => {
//   try {
//     const booking = await Booking.findOne({
//       _id: req.params.id,
//       student: req.user.id,
//       status: "completed",
//     });

//     if (!booking) {
//       return res.status(404).json({ error: "Booking not found" });
//     }

//     // Check if review already exists
//     if (booking.review && booking.review.rating) {
//       return res.status(400).json({
//         error: "You have already submitted a review for this booking",
//         existingReview: booking.review, // Optional: return existing review details
//       });
//     }

//     // Validate rating is between 1-5
//     if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
//       return res.status(400).json({ error: "Rating must be between 1 and 5" });
//     }

//     // Validate comment exists and is not empty
//     if (!req.body.comment || !req.body.comment.trim()) {
//       return res.status(400).json({ error: "Review comment is required" });
//     }

//     // Create or update review
//     booking.review = {
//       rating: req.body.rating,
//       comment: req.body.comment.trim(),
//       // createdAt will be set automatically by the schema
//     };

//     await booking.save();
//     res.json(booking);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

const getTutorReviews = async (req, res) => {
  try {
    const reviews = await Booking.find({
      tutor: req.params.tutorId,
      status: "completed",
      "review.rating": { $exists: true },
    })
      .populate("student", "name profileImage")
      .sort({ "review.createdAt": -1 }); // Newest first

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const expireOldBookings = async () => {
  const now = new Date();
  const currentTime = now.toTimeString().substring(0, 5); // Get current time in HH:MM format

  try {
    // Format the current date and time for the expiryDateTime field
    const expiryDateTime = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const result = await Booking.updateMany(
      {
        status: { $in: ["pending"] },
        $or: [
          { date: { $lt: new Date(now.setHours(0, 0, 0, 0)) } }, // Date is in the past
          {
            date: new Date(now.setHours(0, 0, 0, 0)), // Today's date
            startTime: { $lt: currentTime }, // End time has passed
          },
        ],
      },
      {
        $set: {
          status: "expired",
          isPayable: false,
          expiryDateTime: expiryDateTime,
          cancellationReason:
            "Automatically cancelled because the booking wasn't confirmed before the scheduled time",
          cancelledBy: "system",
        },
      }
    );

    return result;
  } catch (error) {
    console.error("Error expiring old bookings:", error);
    throw error;
  }
};

const checkExpiredBookings = async (req, res, next) => {
  try {
    await expireOldBookings();
    next();
  } catch (error) {
    next(error);
  }
};

const markBookingAsPaid = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, adminName } = req.body;

    // Validate input
    if (!bookingId || !paymentStatus) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the booking and update payment details
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus: "paid",
        paidAt: new Date(),
        payReceiver: adminName,
      },
      { new: true, runValidators: true }
    )
      .populate("tutor", "name email profileImage profileImage2")
      .populate("student", "name email");
    try {
      await NotificationService.createPaymentNotification(
        updatedBooking,
        updatedBooking.price
      );
    } catch (notificationError) {
      console.error("Failed to send payment notification:", notificationError);
    }

    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if booking is completed (since we only show completed bookings for payment)
    // if (updatedBooking.status !== "completed") {
    //   return res.status(400).json({
    //     error: "Only completed bookings can be marked as paid",
    //   });
    // }

    // Here you could add:
    // - Payment confirmation email to student
    // - Notification to tutor
    // - Any other post-payment logic

    res.json({
      message: "Payment recorded successfully",
      booking: updatedBooking,
      paidAt: new Date(),
    });
  } catch (err) {
    console.error("Error marking booking as paid:", err);
    res.status(500).json({
      error: "Failed to update payment status",
      details: err.message,
    });
  }
};

const submitReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const studentId = req.user._id;

    console.log("Review submission started for booking:", id);
    console.log("Rating:", rating, "Comment:", comment);

    // Find the booking
    const booking = await Booking.findById(id)
      .populate("student", "name email")
      .populate("tutor", "name email profileImage2");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if booking belongs to the student
    if (booking.student._id.toString() !== studentId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to review this booking" });
    }

    // Check if booking is completed
    if (booking.status !== "completed") {
      return res
        .status(400)
        .json({ error: "Can only review completed sessions" });
    }

    // Check if already reviewed
    if (booking.review && booking.review.rating) {
      return res.status(400).json({ error: "Booking already reviewed" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Valid rating between 1-5 is required" });
    }

    // Determine if this is for a group session
    const isGroupSession = booking.sessionType === "group";

    // Update the booking with review - use findByIdAndUpdate to trigger hooks
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        $set: {
          review: {
            rating: parseInt(rating),
            comment: comment || "",
            isForGroup: isGroupSession,
            groupSessionId: isGroupSession
              ? booking.groupSession?.groupId
              : undefined,
            reviewedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("student", "name email")
      .populate("tutor", "name");
    try {
      await NotificationService.createReviewNotification(
        updatedBooking,
        rating,
        comment
      );
    } catch (notificationError) {
      console.error("Failed to send review notification:", notificationError);
    }

    if (!updatedBooking) {
      return res.status(404).json({ error: "Failed to update booking" });
    }

    console.log(
      "Booking updated successfully, now calculating tutor ratings..."
    );

    // Manually trigger tutor rating calculation to ensure it runs
    try {
      await Booking.calculateTutorRating(booking.tutor);
      console.log("Tutor rating calculation completed");
    } catch (calcError) {
      console.error("Error in manual tutor rating calculation:", calcError);
      // Don't fail the request if calculation fails, just log it
    }

    // Verify the tutor was updated
    const updatedTutor = await mongoose.model("Tutor").findById(booking.tutor);
    console.log("Updated tutor data:", {
      averageRating: updatedTutor.averageRating,
      reviewCount: updatedTutor.reviewCount,
    });

    res.json({
      message: "Review submitted successfully",
      booking: updatedBooking,
      tutorStats: {
        averageRating: updatedTutor.averageRating,
        reviewCount: updatedTutor.reviewCount,
      },
    });
  } catch (error) {
    console.error("Review submission error:", error);
    res.status(500).json({
      error: "Server error submitting review",
      details: error.message,
    });
  }
};

// Keep the getGroupSessionReviews function for analytics
const getGroupSessionReviews = async (req, res) => {
  try {
    const { groupId } = req.params;

    const reviews = await Booking.find({
      "groupSession.groupId": groupId,
      "review.rating": { $exists: true, $ne: null },
    })
      .populate("student", "name avatar")
      .select("student review.rating review.comment review.reviewedAt")
      .sort({ "review.reviewedAt": -1 });

    if (reviews.length === 0) {
      console.log("reviews.length === 0");
      return res.json({
        groupId,
        totalReviews: 0,
        averageRating: null,
        individualReviews: [],
      });
    }

    const averageRating =
      reviews.reduce((sum, booking) => sum + booking.review.rating, 0) /
      reviews.length;

    const individualReviews = reviews.map((booking) => ({
      student: {
        _id: booking.student._id,
        name: booking.student.name,
        avatar: booking.student.avatar,
      },
      rating: booking.review.rating,
      comment: booking.review.comment,
      reviewedAt: booking.review.reviewedAt,
    }));

    res.json({
      groupId,
      totalReviews: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      individualReviews,
    });
  } catch (error) {
    console.error("Error fetching group session reviews:", error);
    res
      .status(500)
      .json({ error: "Server error fetching group session reviews" });
  }
};

// Debug function to check tutor ratings
const debugTutorRatings = async (req, res) => {
  try {
    const { tutorId } = req.params;

    // Get all reviews for this tutor
    const reviews = await Booking.find({
      tutor: tutorId,
      "review.rating": { $exists: true, $ne: null },
    }).select("review.rating");

    // Manual calculation
    const manualStats = reviews.reduce(
      (acc, booking) => {
        acc.totalRatings += booking.review.rating;
        acc.count++;
        return acc;
      },
      { totalRatings: 0, count: 0 }
    );

    const manualAverage =
      manualStats.count > 0 ? manualStats.totalRatings / manualStats.count : 0;

    // Get current tutor data
    const tutor = await mongoose.model("Tutor").findById(tutorId);

    res.json({
      tutorId,
      manualCalculation: {
        totalRatings: manualStats.totalRatings,
        reviewCount: manualStats.count,
        averageRating: Math.round(manualAverage * 10) / 10,
      },
      currentTutorData: {
        averageRating: tutor.averageRating,
        reviewCount: tutor.reviewCount,
      },
      allReviews: reviews.map((b) => ({
        rating: b.review.rating,
        bookingId: b._id,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBookings,
  createBooking,
  checkAvailability,
  getUserBookings,
  cancelBooking,
  confirmBooking,
  completeBooking,
  submitReview,
  getTutorReviews,
  checkExpiredBookings,
  markBookingAsPaid,
  getGroupSessionReviews,
  debugTutorRatings,
};

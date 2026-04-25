const GroupSession = require("../models/GroupSession");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Tutor = require("../models/Tutor");
const NotificationService = require("../services/notificationService");
//Create group session (TUTOR)
// const createGroupSession = async (req, res) => {
//   try {
//     const { date } = req.body;

//     // Convert the date string to a Date object
//     const dateObj = new Date(date);

//     const groupSession = new GroupSession({
//       ...req.body,
//       formattedDate: dateObj.toLocaleDateString("en-US", {
//         weekday: "long",
//         month: "long",
//         day: "numeric",
//         year: "numeric",
//       }),
//       tutor: req.user.id,
//       currentParticipants: 0,
//       status: "open",
//     });
//     await groupSession.save();
//     res.status(201).json(groupSession);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

//Create group session (TUTOR)
const createGroupSession = async (req, res) => {
  try {
    const { date, startTime, topic, maxParticipants, modality, price, locationDetails, specialInstructions, meetingLink } = req.body;
    const tutorId = req.user.id; // Changed from req.body.tutor

    // Convert the date string to a Date object
    const dateObj = new Date(date);

    // Add date validation here as well
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30); // 1 month in future

    if (dateObj > maxDate) {
      return res.status(400).json({
        error:
          "Group sessions cannot be scheduled more than 1 month in advance",
      });
    }

    // Check for existing bookings at the same date and startTime for this tutor
    const existingBooking = await Booking.findOne({
      tutor: req.user.id,
      date: {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)), // Start of day
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)), // End of day
      },
      startTime: startTime,
      status: { $in: ["pending", "confirmed"] }, // Only check active bookings
    });

    if (existingBooking) {
      return res.status(400).json({
        error:
          "You already have a booking scheduled at this date and time. Please choose a different time slot.",
      });
    }

    // Also check for existing group sessions at the same date and time
    const existingGroupSession = await GroupSession.findOne({
      tutor: req.user.id,
      date: {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lt: new Date(dateObj.setHours(23, 59, 59, 999)),
      },
      startTime: startTime,
      status: { $in: ["scheduled", "open", "full"] }, // Check active group sessions
    });

    if (existingGroupSession) {
      return res.status(400).json({
        error:
          "You already have a group session scheduled at this date and time. Please choose a different time slot.",
      });
    }

    const groupSession = new GroupSession({
      tutor: tutorId, // Use tutorId from req.user.id
      date: dateObj,
      formattedDate: dateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      startTime,
      endTime: `${parseInt(startTime.split(":")[0]) + 1}:${startTime.split(":")[1]}`, // Auto-calculate end time
      topic,
      modality,
      maxParticipants,
      price,
      locationDetails,
      specialInstructions,
      meetingLink,
      currentParticipants: 0,
      participants: [],
      status: "open",
    });

    await groupSession.save();
    // Get tutor info for notification
    const tutorInfo = await Tutor.findById(tutorId);
    
    // Create notification for tutor
    try {
      await NotificationService.createGroupSessionCreatedNotification(
        groupSession,
        tutorInfo
      );
    } catch (notificationError) {
      console.error("Failed to send group session creation notification:", notificationError);
    }
    res.status(201).json(groupSession);
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(400).json({ error: error.message });
  }
};

// Get tutor's group sessions
const getTutorsGroupSession = async (req, res) => {
  try {
    const sessions = await GroupSession.find({
      tutor: req.params.tutorId,
    }).populate("participants.student", "name email profileImage");
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete group session
const deleteGroupSession = async (req, res) => {
  try {
    const session = await GroupSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.tutor.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    await GroupSession.findByIdAndDelete(req.params.id);
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New function to handle group bookings
const joinGroupSession = async (req, res) => {
  const {
    tutorId,
    date,
    formattedDate,
    startTime,
    endTime,
    topic,
    modality,
    price,
    sessionType,
  } = req.body;
  const studentId = req.user._id;

  try {
    // First check if student already has ANY booking for this time slot
    const existingStudentBooking = await Booking.findOne({
      student: studentId,
      tutor: tutorId,
      date: new Date(date),
      startTime: startTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingStudentBooking) {
      return res.status(409).json({
        error: "You already have a booking for this time slot",
        message:
          "You already have a booking for this time slot. Please check your bookings.",
      });
    }

    // Check if there's an existing group session for this time slot
    const existingGroupSession = await GroupSession.findOne({
      tutor: tutorId,
      formattedDate: formattedDate,
      startTime: startTime,
      status: { $in: ["open", "full"] },
    });
    if (!existingGroupSession) {
      return res.status(409).json({
        error: "No existing group session",
        message: `No existing group session ${date}`,
      });
    }

    let groupSession;
    let booking;

    if (
      existingGroupSession &&
      existingGroupSession.currentParticipants <
        existingGroupSession.maxParticipants
    ) {
      // Join existing group session - FIRST try to create booking
      try {
        // Create booking first
        booking = new Booking({
          student: studentId,
          tutor: tutorId,
          date: new Date(date),
          formattedDate,
          startTime,
          endTime:
            endTime ||
            `${parseInt(startTime.split(":")[0]) + 1}:${
              startTime.split(":")[1]
            }`,
          topic,
          modality,
          sessionType: "group",
          price,
          status: "pending",
          groupSession: {
            isGroup: true,
            groupId: existingGroupSession._id,
            maxParticipants: existingGroupSession.maxParticipants,
            currentParticipants: existingGroupSession.currentParticipants + 1,
            participants: [
              {
                student: studentId,
              },
            ], //replace with existingGroupSession.participants
          },
          meetingLink: existingGroupSession.meetingLink,
          locationDetails: existingGroupSession.locationDetails,
          specialInstructions: existingGroupSession.specialInstructions,
        });

        await booking.save();

        // If booking succeeds, then update group session
        groupSession = existingGroupSession;
        groupSession.currentParticipants += 1;

        // ADD THIS: Push the student to the participants array
        groupSession.participants.push({
          student: studentId,
          status: "confirmed",
        });

        if (groupSession.currentParticipants >= groupSession.maxParticipants) {
          groupSession.status = "full";
        }

        await groupSession.save();

        // NOTIFICATION: Notify tutor that a student joined
        try {
          const studentInfo = await User.findById(studentId);
          const tutorInfo = await Tutor.findById(tutorId);
          
          await NotificationService.createGroupSessionJoinNotification(
            booking,
            groupSession,
            studentInfo,
            tutorInfo
          );
        } catch (notificationError) {
          console.error("Failed to send join notification:", notificationError);
        }
      } catch (bookingError) {
        // If booking fails, don't update group session
        if (bookingError.code === 11000) {
          return res.status(409).json({
            error: "Duplicate booking",
            message: "You already have a booking for this time slot.",
          });
        }
        throw bookingError;
      }
    } else {
      // Create new group session - create group session first
      groupSession = new GroupSession({
        tutor: tutorId,
        date: new Date(date),
        startTime,
        endTime:
          endTime ||
          `${parseInt(startTime.split(":")[0]) + 1}:${startTime.split(":")[1]}`,
        topic,
        modality,
        maxParticipants: 5,
        currentParticipants: 1,
        status: "open",
        price,
        meetingLink: modality === "online" ? "To be provided" : "",
        locationDetails: modality === "face-to-face" ? "To be provided" : "",
        // ADD THIS: Initialize participants array with the first student
        participants: [
          {
            student: studentId,
            status: "confirmed",
          },
        ],
      });

      await groupSession.save();

      // Then create booking
      booking = new Booking({
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
        sessionType: "group",
        price,
        groupSession: {
          isGroup: true,
          groupId: groupSession._id,
          maxParticipants: groupSession.maxParticipants,
          currentParticipants: groupSession.currentParticipants,
          participants: [
            {
              student: studentId,
              status: "confirmed",
            },
          ],
        },
      });

      await booking.save();
    }

    // Populate and return response
    const populatedBooking = await Booking.findById(booking._id)
      .populate("student", "name email")
      .populate("tutor", "name email");

    // Also populate the group session with participant details
    const populatedGroupSession = await GroupSession.findById(
      groupSession._id
    ).populate("participants.student", "name email");

    res.status(201).json({
      message: "Group booking created successfully",
      booking: populatedBooking,
      groupSession: populatedGroupSession,
    });
  } catch (error) {
    console.error("Group booking error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        error: "Duplicate booking",
        message: "You already have a booking for this time slot.",
      });
    }

    res.status(500).json({
      error: "Server error creating group booking",
      message: error.message,
    });
  }
};

// Get available group sessions for a tutor
const getAvailableGroupSessions = async (req, res) => {
  try {
    const { tutorId, date: dateParam } = req.query;
    // Validate required parameters
    if (!tutorId || !dateParam) {
      return res.status(400).json({
        error: "Missing required parameters: tutorId and date",
      });
    }

    // Parse the date correctly
    const queryDate = new Date(dateParam);
    queryDate.setHours(0, 0, 0, 0); // Start of the day in UTC

    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1); // Start of next day

    console.log("Query date range:", {
      from: queryDate.toISOString(),
      to: nextDay.toISOString(),
    });

    // Get all open sessions for the specific date
    const sessions = await GroupSession.find({
      tutor: tutorId,
      date: {
        $gte: queryDate,
        $lt: nextDay,
      },
      status: { $in: ["open", "scheduled"] }, // Changed from 'scheduled' to 'open'
    }).lean();

    console.log("Found sessions:", sessions.length);
    sessions.forEach((session) => {
      console.log("Session:", {
        date: session.date,
        startTime: session.startTime,
        topic: session.topic,
        current: session.currentParticipants,
        max: session.maxParticipants,
      });
    });

    // Filter sessions that have available space
    const availableSessions = sessions.filter(
      (session) => session.currentParticipants < session.maxParticipants
    );

    // Convert to object keyed by startTime for frontend
    const sessionsByTime = {};
    availableSessions.forEach((session) => {
      // Use 24-hour format for consistency with frontend
      const time24Hour = convertTo24Hour(session.startTime);
      sessionsByTime[time24Hour] = {
        _id: session._id,
        maxParticipants: session.maxParticipants,
        currentParticipants: session.currentParticipants,
        availableSpots: session.maxParticipants - session.currentParticipants,
        topic: session.topic,
        modality: session.modality,
      };
    });

    console.log("Sessions by time:", sessionsByTime);
    res.json(sessionsByTime);
  } catch (error) {
    console.error("Error fetching group sessions:", error);
    res.status(500).json({ error: "Server error fetching group sessions" });
  }
};

// Helper function to convert 12-hour to 24-hour format
function convertTo24Hour(time12h) {
  if (!time12h) return time12h;

  // If already in 24-hour format, return as is
  if (time12h.includes(":")) {
    const [timePart, period] = time12h.split(" ");
    if (!period) return time12h; // Already 24-hour

    let [hours, minutes] = timePart.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  return time12h;
}

// Get participants for a group session
const getGroupSessionParticipants = async (groupId) => {
  return await Booking.find({
    "groupSession.groupId": groupId,
    status: { $in: ["pending", "confirmed"] },
  }).populate("student", "name email profileImage");
};

// Cancel group session booking (STUDENT)
const cancelGroupSessionBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const { reason } = req.body;
    const studentId = req.user._id;

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("student", "name email")
      .populate("tutor", "name email");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if the booking belongs to the student
    if (booking.student._id.toString() !== studentId.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to cancel this booking" });
    }

    // Check if booking is already cancelled or completed
    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({
        error: `Cannot cancel a booking that is already ${booking.status}`,
      });
    }

    // Check if it's a group session
    if (!booking.groupSession?.isGroup) {
      return res.status(400).json({
        error: "This is not a group session booking",
      });
    }

    // Check if session has already started/ended
    const sessionDate = new Date(booking.date);
    const sessionStartTime = booking.startTime;
    const [hours, minutes] = sessionStartTime.split(":").map(Number);
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const twentyFourHoursBeforeSession = new Date(
      sessionDate.getTime() - 24 * 60 * 60000
    );

    // if (now >= twentyFourHoursBeforeSession) {
    //   // return res.status(400).json({
    //   //   error: "Cannot cancel session within 24 hours of start time",
    //   // });
    // }

    if (!(now > twentyFourHoursBeforeSession)) {
      booking.isPayable = false;
    }

    // Start transaction-like operations
    let groupSession;

    // If this is a confirmed booking, update the group session participant count
    if (booking.status === "confirmed" || booking.status === "pending") {
      groupSession = await GroupSession.findById(booking.groupSession.groupId);

      if (groupSession) {
        // Remove student from participants array in GroupSession using $pull
        await GroupSession.findByIdAndUpdate(booking.groupSession.groupId, {
          $pull: {
            participants: { student: studentId },
          },
        });

        // Remove student from participants array in Booking document
        booking.groupSession.participants =
          booking.groupSession.participants.filter(
            (participant) =>
              participant.student.toString() !== studentId.toString()
          );

        // Decrement participant count in GroupSession
        groupSession.currentParticipants = Math.max(
          0,
          groupSession.currentParticipants - 1
        );

        // Decrement participant count in Booking
        booking.groupSession.currentParticipants = Math.max(
          0,
          booking.groupSession.currentParticipants - 1
        );

        // Update session status if it was full
        if (
          groupSession.status === "full" &&
          groupSession.currentParticipants < groupSession.maxParticipants
        ) {
          groupSession.status = "open";
        }

        await groupSession.save();
      }
    }

    // Update the booking status (REMOVED cancelledAt since field doesn't exist)
    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = "student";
    booking.cancelledAt = new Date(); // Remove this line until you add the field to schema

    await booking.save();

    // NOTIFICATION: Notify tutor that student cancelled
    try {
      const groupSessionInfo = await GroupSession.findById(booking.groupSession.groupId);
      
      await NotificationService.createGroupSessionCancellationNotification(
        booking,
        groupSessionInfo,
        "student"
      );
    } catch (notificationError) {
      console.error("Failed to send cancellation notification:", notificationError);
    }

    res.json({
      message: "Group session booking cancelled successfully",
      booking: {
        _id: booking._id,
        status: booking.status,
        cancellationReason: booking.cancellationReason,
        cancelledBy: booking.cancelledBy,
        cancelledAt: booking.cancelledAt, // Remove this from response too
      },
      groupSession: groupSession
        ? {
            _id: groupSession._id,
            currentParticipants: groupSession.currentParticipants,
            status: groupSession.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Error cancelling group session booking:", error);
    res.status(500).json({
      error: "Server error cancelling group session booking",
      message: error.message,
    });
  }
};

// Complete group session (TUTOR)
const completeGroupSessionBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Proof image is required" });
    }

    // Find the group session
    const groupSession = await GroupSession.findById(id);
    if (!groupSession) {
      return res.status(404).json({ error: "Group session not found" });
    }

    // Check if the tutor owns this group session
    if (groupSession.tutor.toString() !== req.user.id) {
      return res.status(403).json({
        error: "Not authorized to complete this group session",
      });
    }

    // Check if session is already completed
    if (groupSession.status === "completed") {
      return res.status(400).json({
        error: "Group session is already completed",
      });
    }

    // Check if session can be completed (should be in past or current time)
    const sessionDateTime = new Date(groupSession.date);
    const [hours, minutes] = groupSession.startTime.split(":").map(Number);
    sessionDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();

    // Allow completion only after session start time
    if (now < sessionDateTime) {
      return res.status(400).json({
        error: "Cannot complete session before it starts",
      });
    }

    // Update group session status to "completed"
    groupSession.status = "completed";
    await groupSession.save();

    // Get the proof file name from multer
    const proofFileName = req.file.filename;

    // Update all related individual bookings to "completed" and add proofOfCompletion
    const updatedBookings = await Booking.updateMany(
      {
        "groupSession.groupId": id,
        status: { $in: ["pending", "confirmed"] },
      },
      {
        $set: {
          status: "completed",
          proofOfCompletion: proofFileName,
        },
      }
    );

    console.log(
      `Updated ${updatedBookings.modifiedCount} bookings for group session ${id}`
    );

    // Get all participants to notify them
    const participantBookings = await Booking.find({
      "groupSession.groupId": id,
      status: "completed"
    }).populate("student", "name email");

    // NOTIFICATION: Notify all participants that session is completed
    try {
      const tutorInfo = await Tutor.findById(req.user.id);
      
      for (const participantBooking of participantBookings) {
        await NotificationService.createGroupSessionCompletedNotification(
          participantBooking,
          groupSession,
          tutorInfo
        );
      }
    } catch (notificationError) {
      console.error("Failed to send completion notifications:", notificationError);
    }

    // Get the updated group session with populated participants
    const populatedGroupSession = await GroupSession.findById(id).populate(
      "participants.student",
      "name email avatar"
    );

    res.json({
      message: "Group session marked as completed successfully",
      groupSession: populatedGroupSession,
      updatedBookings: updatedBookings.modifiedCount,
      proofFile: proofFileName,
    });
  } catch (error) {
    console.error("Error completing group session:", error);
    res.status(500).json({
      error: "Server error completing group session",
      message: error.message,
    });
  }
};

// Get student's group session bookings
const getStudentGroupSessions = async (req, res) => {
  try {
    const studentId = req.user._id;

    const groupBookings = await Booking.find({
      student: studentId,
      "groupSession.isGroup": true,
    })
      .populate("tutor", "name profileImage profileImage2")
      .sort({ date: -1, startTime: -1 });

    res.json(groupBookings);
  } catch (error) {
    console.error("Error fetching student group sessions:", error);
    res.status(500).json({ error: error.message });
  }
};

// Auto-confirm pending group sessions within 24 hours
const autoConfirmGroupSessions = async () => {
  try {
    const now = new Date();

    // Calculate 24 hours from now
    const twentyFourHoursFromNow = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    const confirmedDateTime = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    console.log("Auto-confirm group sessions check:", {
      now: now.toISOString(),
      twentyFourHoursFromNow: twentyFourHoursFromNow.toISOString(),
    });

    // Find group bookings that are pending and within 24 hours
    const bookingsToConfirm = await Booking.find({
      sessionType: "group",
      status: "pending",
      date: {
        $lte: twentyFourHoursFromNow,
        $gte: now, // Ensure it's in the future
      },
    })
      .populate("tutor", "name")
      .populate("student", "name");

    console.log(
      `Found ${bookingsToConfirm.length} group sessions to auto-confirm`
    );

    if (bookingsToConfirm.length === 0) {
      return 0;
    }

    // Update all matching bookings
    const result = await Booking.updateMany(
      {
        _id: { $in: bookingsToConfirm.map((b) => b._id) },
        status: "pending",
      },
      {
        $set: {
          status: "confirmed",
          confirmedDateTime: confirmedDateTime,
        },
      }
    );

    console.log(`Auto-confirmed ${result.modifiedCount} group sessions`);

    // Log details of confirmed sessions
    bookingsToConfirm.forEach((booking) => {
      if (result.modifiedCount > 0) {
        console.log(
          `Auto-confirmed: ${booking.topic} on ${booking.formattedDate} at ${booking.startTime}`
        );
      }
    });

    return result.modifiedCount;
  } catch (error) {
    console.error("Error auto-confirming group sessions:", error);
    throw error;
  }
};

// Middleware to auto-confirm group sessions (to be used in routes)
const checkAndConfirmGroupSessions = async (req, res, next) => {
  try {
    await autoConfirmGroupSessions();
    next();
  } catch (error) {
    console.error(
      "Error in group session auto-confirmation middleware:",
      error
    );
    next(); // Don't block the request if auto-confirm fails
  }
};

// Cancel group session (TUTOR)
const cancelGroupSessionByTutor = async (req, res) => {
  try {
    const { id: groupSessionId } = req.params;
    const { reason } = req.body;
    const tutorId = req.user._id;
    const now = new Date();

    // Find the group session
    const groupSession = await GroupSession.findById(groupSessionId);

    if (!groupSession) {
      return res.status(404).json({ error: "Group session not found" });
    }

    // Check if the tutor owns this group session
    if (groupSession.tutor.toString() !== tutorId.toString()) {
      return res.status(403).json({
        error: "Not authorized to cancel this group session",
      });
    }

    // Check if session is already cancelled or completed
    if (
      groupSession.status === "cancelled" ||
      groupSession.status === "completed"
    ) {
      return res.status(400).json({
        error: `Cannot cancel a group session that is already ${groupSession.status}`,
      });
    }

    // Check if session has already started
    const sessionDate = new Date(groupSession.date);
    const [hours, minutes] = groupSession.startTime.split(":").map(Number);
    sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
    const isMoreThan24Hours = sessionDate - now > twentyFourHoursInMs;

    if (new Date() >= sessionDate) {
      return res.status(400).json({
        error: "Cannot cancel a group session that has already started",
      });
    }

    if (!isMoreThan24Hours) {
      // Increment cancellation count and check if tutor should be deactivated
      const updatedTutor = await Tutor.findByIdAndUpdate(
        tutorId,
        {
          $inc: { onDayCancellationCount: 1 },
        },
        { new: true } // This returns the updated document
      );

      // Check if cancellation count is >= 3 and deactivate tutor
      if (updatedTutor.onDayCancellationCount >= 3) {
        await Tutor.findByIdAndUpdate(tutorId, {
          $set: { isActive: false },
        });
      }
    }

     // Get all participants before updating
    const participantBookings = await Booking.find({
      "groupSession.groupId": groupSessionId,
      status: { $in: ["pending", "confirmed"] },
    }).populate("student", "name email");

    // Update all related bookings
    const bookingUpdateResult = await Booking.updateMany(
      {
        "groupSession.groupId": groupSessionId,
        status: { $in: ["pending", "confirmed"] },
      },
      {
        $set: {
          isPayable: false,
          status: "cancelled",
          cancellationReason: reason,
          cancelledBy: "tutor",
          cancelledAt: new Date(),
        },
      }
    );

    // Update group session status
    groupSession.status = "cancelled";
    groupSession.cancellationReason = reason;
    groupSession.cancelledBy = "tutor";
    groupSession.cancelledAt = new Date();
    await groupSession.save();

    // NOTIFICATION: Notify all participants that tutor cancelled using bulk method
    try {
      const tutorInfo = await Tutor.findById(tutorId);
      
      await NotificationService.createGroupSessionBulkCancellationNotification(
        participantBookings,
        groupSession,
        tutorInfo
      );
    } catch (notificationError) {
      console.error("Failed to send cancellation notifications:", notificationError);
    }

    res.json({
      message: "Group session cancelled successfully",
      groupSession: {
        _id: groupSession._id,
        status: groupSession.status,
        topic: groupSession.topic,
        date: groupSession.date,
        startTime: groupSession.startTime,
        cancellationReason: groupSession.cancellationReason,
      },
      statistics: {
        cancelledBookings: bookingUpdateResult.modifiedCount,
        totalParticipants: groupSession.participants.length,
      },
    });
  } catch (error) {
    console.error("Error cancelling group session by tutor:", error);
    res.status(500).json({
      error: "Server error cancelling group session",
      message: error.message,
    });
  }
};

// Auto-expire empty group sessions within 24 hours
const autoExpireEmptyGroupSessions = async () => {
  try {
    const now = new Date();

    const expiryDateTime = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Calculate 24 hours from now
    const twentyFourHoursFromNow = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    console.log("Auto-expire empty group sessions check:", {
      now: now.toISOString(),
      twentyFourHoursFromNow: twentyFourHoursFromNow.toISOString(),
    });

    // Find group sessions that are empty and within 24 hours
    const sessionsToExpire = await GroupSession.find({
      currentParticipants: 0, // Only sessions with 0 participants
      status: { $in: ["open", "scheduled"] }, // Sessions that are still open/scheduled
      date: {
        $lte: twentyFourHoursFromNow,
        $gte: now, // Ensure it's in the future
      },
    }).populate("tutor", "name");

    console.log(
      `Found ${sessionsToExpire.length} empty group sessions to expire`
    );

    if (sessionsToExpire.length === 0) {
      return 0;
    }

    // Update all matching group sessions
    const groupSessionResult = await GroupSession.updateMany(
      {
        _id: { $in: sessionsToExpire.map((s) => s._id) },
        currentParticipants: 0,
        status: { $in: ["open", "scheduled"] },
      },
      {
        $set: {
          status: "cancelled",
          cancellationReason:
            "Session automatically cancelled due to no participants",
          expiryDateTime: expiryDateTime,
          cancelledBy: "system",
        },
      }
    );

    // Also update any related bookings for these group sessions
    const bookingResult = await Booking.updateMany(
      {
        "groupSession.groupId": { $in: sessionsToExpire.map((s) => s._id) },
        status: "pending",
      },
      {
        $set: {
          status: "expired",
          cancellationReason:
            "Session automatically cancelled due to no participants",
          cancelledBy: "system",
        },
      }
    );

    console.log(
      `Auto-expired ${groupSessionResult.modifiedCount} empty group sessions and ${bookingResult.modifiedCount} related bookings`
    );

    // NOTIFICATION: Notify tutors about auto-expired sessions
    try {
      for (const session of sessionsToExpire) {
        await NotificationService.createGroupSessionAutoExpiredNotification(
          session
        );
      }
    } catch (notificationError) {
      console.error("Failed to send auto-expire notifications:", notificationError);
    }

    // Log details of expired sessions
    sessionsToExpire.forEach((session) => {
      if (groupSessionResult.modifiedCount > 0) {
        console.log(
          `Auto-expired empty session: ${session.topic} on ${session.formattedDate} at ${session.startTime}`
        );
      }
    });

    return {
      expiredSessions: groupSessionResult.modifiedCount,
      expiredBookings: bookingResult.modifiedCount,
    };
  } catch (error) {
    console.error("Error auto-expiring empty group sessions:", error);
    throw error;
  }
};

// Combined middleware for both auto-confirm and auto-expire
const checkAndUpdateGroupSessions = async (req, res, next) => {
  try {
    // Run both auto-confirm and auto-expire
    await autoConfirmGroupSessions();
    await autoExpireEmptyGroupSessions();
    next();
  } catch (error) {
    console.error("Error in group session auto-update middleware:", error);
    next(); // Don't block the request if auto-update fails
  }
};

module.exports = {
  joinGroupSession,
  getAvailableGroupSessions,
  getGroupSessionParticipants,
  getTutorsGroupSession,
  createGroupSession,
  deleteGroupSession,
  cancelGroupSessionBooking,
  completeGroupSessionBooking,
  getStudentGroupSessions,
  checkAndConfirmGroupSessions,
  cancelGroupSessionByTutor,
  checkAndUpdateGroupSessions,
};

import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Event from "../models/Event.js";
import StudentEvent from "../models/StudentEvent.js";
import StudentTicket from "../models/StudentTicket.js";

const getStudentIdFromReq = (req) => {
  return req.user?.sub || req.user?.id || req.user?._id || null;
};

export const createFeedback = async (req, res) => {
  try {
    const studentId = getStudentIdFromReq(req);
    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    if (!rating || !comment?.trim()) {
      return res.status(400).json({
        message: "Rating and comment are required",
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const objectStudentId = new mongoose.Types.ObjectId(studentId);
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const now = new Date();
    const eventDate = new Date(event.date);

    if (eventDate >= now) {
      return res.status(400).json({
        message: "Feedback can only be submitted for past events",
      });
    }

    const joinedFreeFromEvent =
      Array.isArray(event.goingStudents) &&
      event.goingStudents.some((id) => String(id) === String(objectStudentId));

    const purchasedPaidFromEvent =
      Array.isArray(event.purchasedStudents) &&
      event.purchasedStudents.some(
        (id) => String(id) === String(objectStudentId)
      );

    const participationRecords = await StudentEvent.find({
      student: objectStudentId,
    }).populate("event");

    const validParticipation = participationRecords.some((item) => {
      return item.event && String(item.event._id) === String(eventId);
    });

    const ticketRecords = await StudentTicket.find({
      student: objectStudentId,
    }).populate("event");

    const validTicket = ticketRecords.some((item) => {
      return item.event && String(item.event._id) === String(eventId);
    });

    const isEligible =
      joinedFreeFromEvent ||
      purchasedPaidFromEvent ||
      validParticipation ||
      validTicket;

    if (!isEligible) {
      return res.status(403).json({
        message:
          "Only students who joined or purchased this event can leave feedback",
      });
    }

    const existingFeedback = await Feedback.findOne({
      event: eventId,
      student: objectStudentId,
    });

    if (existingFeedback) {
      return res.status(400).json({
        message: "You have already submitted feedback for this event",
      });
    }

    const feedback = await Feedback.create({
      event: eventId,
      student: objectStudentId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const populatedFeedback = await Feedback.findById(feedback._id).populate(
      "student",
      "name fullName email"
    );

    return res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: populatedFeedback,
    });
  } catch (error) {
    console.error("createFeedback error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted feedback for this event",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      message: error.message || "Server error while submitting feedback",
    });
  }
};

export const getEventFeedbacks = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const feedbacks = await Feedback.find({ event: eventId })
      .populate("student", "name fullName")
      .sort({ createdAt: -1 });

    const stats = await Feedback.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
        },
      },
      {
        $group: {
          _id: "$event",
          averageRating: { $avg: "$rating" },
          totalFeedbacks: { $sum: 1 },
        },
      },
    ]);

    const formattedFeedbacks = feedbacks.map((item) => ({
      _id: item._id,
      rating: item.rating,
      comment: item.comment,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      student: item.student,
      studentName: item.student?.fullName || item.student?.name || "Student",
      studentId: item.student?._id || null,
    }));

    return res.json({
      feedbacks: formattedFeedbacks,
      stats: stats[0] || {
        averageRating: 0,
        totalFeedbacks: 0,
      },
    });
  } catch (error) {
    console.error("getEventFeedbacks error:", error);
    return res.status(500).json({
      message: error.message || "Server error while fetching feedback",
    });
  }
};

export const getMyFeedbackStatus = async (req, res) => {
  try {
    const studentId = getStudentIdFromReq(req);

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();
    const objectStudentId = new mongoose.Types.ObjectId(studentId);

    const allPastEvents = await Event.find({
      date: { $lt: now },
    }).select("_id title date goingStudents purchasedStudents");

    const eligibleEvents = allPastEvents.filter((event) => {
      const joinedFree =
        Array.isArray(event.goingStudents) &&
        event.goingStudents.some(
          (id) => String(id) === String(objectStudentId)
        );

      const purchasedPaid =
        Array.isArray(event.purchasedStudents) &&
        event.purchasedStudents.some(
          (id) => String(id) === String(objectStudentId)
        );

      return joinedFree || purchasedPaid;
    });

    const submittedFeedbacks = await Feedback.find({
      student: objectStudentId,
    }).select("event");

    const eligibleEventIds = eligibleEvents.map((event) => String(event._id));

    const submittedEventIds = submittedFeedbacks.map((item) =>
      String(item.event)
    );

    return res.json({
      eligibleEvents,
      eligibleEventIds,
      submittedEventIds,
    });
  } catch (error) {
    console.error("getMyFeedbackStatus error:", error);
    return res.status(500).json({
      message: error.message || "Server error while fetching feedback status",
    });
  }
};

export const getMyFeedbackByEvent = async (req, res) => {
  try {
    const studentId = getStudentIdFromReq(req);
    const { eventId } = req.params;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const feedback = await Feedback.findOne({
      event: eventId,
      student: studentId,
    }).populate("student", "name fullName email");

    return res.json({
      feedback: feedback || null,
    });
  } catch (error) {
    console.error("getMyFeedbackByEvent error:", error);
    return res.status(500).json({
      message: error.message || "Server error while fetching your feedback",
    });
  }
};

export const updateMyFeedback = async (req, res) => {
  try {
    const studentId = getStudentIdFromReq(req);
    const { eventId } = req.params;
    const { rating, comment } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    if (!rating || !comment?.trim()) {
      return res.status(400).json({
        message: "Rating and comment are required",
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const existingFeedback = await Feedback.findOne({
      event: eventId,
      student: studentId,
    });

    if (!existingFeedback) {
      return res.status(404).json({
        message: "Your feedback was not found",
      });
    }

    existingFeedback.rating = Number(rating);
    existingFeedback.comment = comment.trim();

    await existingFeedback.save();

    const updatedFeedback = await Feedback.findById(existingFeedback._id)
      .populate("student", "name fullName email");

    return res.json({
      message: "Feedback updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("updateMyFeedback error:", error);
    return res.status(500).json({
      message: error.message || "Server error while updating feedback",
    });
  }
};

export const deleteMyFeedback = async (req, res) => {
  try {
    const studentId = getStudentIdFromReq(req);
    const { eventId } = req.params;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const deleted = await Feedback.findOneAndDelete({
      event: eventId,
      student: studentId,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Your feedback was not found",
      });
    }

    return res.json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("deleteMyFeedback error:", error);
    return res.status(500).json({
      message: error.message || "Server error while deleting feedback",
    });
  }
};
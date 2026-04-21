import Event from "../models/Event.js";
import StudentEvent from "../models/StudentEvent.js";
import Club from "../models/Club.js";

export async function getStudentEventDetails(req, res) {
  try {
    const studentId = req.user?.sub;
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      status: "approved",
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const rawClubId = String(event.clubid || "");
    const cleanClubId = rawClubId.trim();

    console.log("========== EVENT DETAILS DEBUG ==========");
    console.log("Event _id:", event._id.toString());
    console.log("Raw event clubid:", JSON.stringify(rawClubId));
    console.log("Clean event clubid:", JSON.stringify(cleanClubId));

    const allClubs = await Club.find().select("clubName clubid");
    console.log(
      "All clubs:",
      allClubs.map((c) => ({
        clubName: c.clubName,
        clubid: c.clubid,
      }))
    );

    const club = await Club.findOne({
      $or: [
        { clubid: cleanClubId },
        { clubid: rawClubId },
        { clubid: { $regex: `^${cleanClubId}$`, $options: "i" } },
      ],
    }).select("clubName clubid");

    console.log(
      "Matched club:",
      club
        ? { clubName: club.clubName, clubid: club.clubid }
        : null
    );
    console.log("========================================");

    const studentEvent = await StudentEvent.findOne({
      student: studentId,
      event: event._id,
    });

    return res.status(200).json({
      event: {
        ...event.toObject(),
        clubName: club?.clubName || "Unknown Club",
      },
      studentStatus: studentEvent
        ? {
            status: studentEvent.status,
            paymentStatus: studentEvent.paymentStatus,
          }
        : null,
    });
  } catch (error) {
    console.error("getStudentEventDetails error:", error);
    return res.status(500).json({
      message: "Failed to load event details",
      error: error.message,
    });
  }
}

export async function markGoing(req, res) {
  try {
    const studentId = req.user?.sub;
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      status: "approved",
      ispaid: false,
    });

    if (!event) {
      return res.status(404).json({ message: "Free approved event not found" });
    }

    const existing = await StudentEvent.findOne({
      student: studentId,
      event: event._id,
    });

    if (existing) {
      return res.status(200).json({
        message: "You already joined this event",
        studentEvent: existing,
      });
    }

    const studentEvent = await StudentEvent.create({
      student: studentId,
      event: event._id,
      status: "going",
      paymentStatus: "none",
    });

    return res.status(201).json({
      message: "Successfully marked as going",
      studentEvent,
    });
  } catch (error) {
    console.error("markGoing error:", error);
    return res.status(500).json({
      message: "Failed to join event",
      error: error.message,
    });
  }
}

export async function removeGoing(req, res) {
  try {
    const studentId = req.user?.sub;
    const { id } = req.params;

    const deleted = await StudentEvent.findOneAndDelete({
      student: studentId,
      event: id,
      status: "going",
    });

    if (!deleted) {
      return res.status(404).json({ message: "Joined event record not found" });
    }

    return res.status(200).json({
      message: "Removed from going list successfully",
    });
  } catch (error) {
    console.error("removeGoing error:", error);
    return res.status(500).json({
      message: "Failed to remove joined event",
      error: error.message,
    });
  }
}

export async function requestTicket(req, res) {
  try {
    const studentId = req.user?.sub;
    const { id } = req.params;

    const event = await Event.findOne({
      _id: id,
      status: "approved",
      ispaid: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Paid approved event not found" });
    }

    const existing = await StudentEvent.findOne({
      student: studentId,
      event: event._id,
    });

    if (existing) {
      return res.status(200).json({
        message: "Ticket request already exists",
        studentEvent: existing,
      });
    }

    const studentEvent = await StudentEvent.create({
      student: studentId,
      event: event._id,
      status: "ticket_requested",
      paymentStatus: "pending",
    });

    return res.status(201).json({
      message: "Ticket request submitted successfully",
      studentEvent,
    });
  } catch (error) {
    console.error("requestTicket error:", error);
    return res.status(500).json({
      message: "Failed to request ticket",
      error: error.message,
    });
  }
}

export async function getMyStudentEvents(req, res) {
  try {
    const studentId = req.user?.sub;

    const studentEvents = await StudentEvent.find({ student: studentId })
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json(studentEvents);
  } catch (error) {
    console.error("getMyStudentEvents error:", error);
    return res.status(500).json({
      message: "Failed to load student events",
      error: error.message,
    });
  }
}
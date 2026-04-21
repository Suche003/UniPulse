import Event from "../models/Event.js";
import Student from "../models/Student.js";
import StudentTicket from "../models/StudentTicket.js";
import StudentEvent from "../models/StudentEvent.js";

export async function getTicketPurchaseData(req, res) {
  try {
    const studentMongoId = req.user?.sub;
    const { eventId } = req.params;

    const student = await Student.findById(studentMongoId).select(
      "studentId regNo registrationNo"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const event = await Event.findOne({
      _id: eventId,
      status: "approved",
      ispaid: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Paid event not found" });
    }

    const existingTicket = await StudentTicket.findOne({
      student: studentMongoId,
      event: event._id,
    });

    return res.status(200).json({
      event: {
        _id: event._id,
        eventid: event.eventid,
        title: event.title,
        date: event.date,
        time: event.date,
        amount: event.ticketPrice || 0,
      },
      student: {
        studentMongoId,
        studentIdDisplay:
          student.studentId || student.regNo || student.registrationNo || "N/A",
      },
      alreadyExists: !!existingTicket,
      existingTicket: existingTicket || null,
    });
  } catch (error) {
    console.error("getTicketPurchaseData error:", error);
    return res.status(500).json({
      message: "Failed to load purchase form",
      error: error.message,
    });
  }
}

export async function createTicketPurchase(req, res) {
  try {
    const studentMongoId = req.user?.sub;
    const { eventId } = req.params;

    const student = await Student.findById(studentMongoId).select(
      "studentId regNo registrationNo"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const event = await Event.findOne({
      _id: eventId,
      status: "approved",
      ispaid: true,
    });

    if (!event) {
      return res.status(404).json({ message: "Paid event not found" });
    }

    const existingTicket = await StudentTicket.findOne({
      student: studentMongoId,
      event: event._id,
    });

    if (existingTicket) {
      return res.status(200).json({
        message: "Ticket already created for this student and event",
        ticket: existingTicket,
      });
    }

    const ticket = await StudentTicket.create({
      student: studentMongoId,
      event: event._id,
      studentIdDisplay:
        student.studentId || student.regNo || student.registrationNo || "N/A",
      eventName: event.title,
      eventDate: event.date,
      amount: event.ticketPrice || 0,
      quantity: 1,
      status: "initiated",
    });

    return res.status(201).json({
      message: "Ticket purchase initiated",
      ticket,
    });
  } catch (error) {
    console.error("createTicketPurchase error:", error);
    return res.status(500).json({
      message: "Failed to create ticket purchase",
      error: error.message,
    });
  }
}

export async function getTicketById(req, res) {
  try {
    const studentMongoId = req.user?.sub;
    const { ticketId } = req.params;

    const ticket = await StudentTicket.findOne({
      _id: ticketId,
      student: studentMongoId,
    }).populate("event");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({
      _id: ticket._id,
      eventName: ticket.eventName,
      eventDate: ticket.eventDate,
      amount: ticket.amount,
      quantity: ticket.quantity,
      status: ticket.status,
      studentIdDisplay: ticket.studentIdDisplay,
      event: ticket.event,
    });
  } catch (error) {
    console.error("getTicketById error:", error);
    return res.status(500).json({
      message: "Failed to load ticket",
      error: error.message,
    });
  }
}

export async function completeDemoPayment(req, res) {
  try {
    const studentMongoId = req.user?.sub;
    const { ticketId } = req.params;

    const ticket = await StudentTicket.findOne({
      _id: ticketId,
      student: studentMongoId,
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const event = await Event.findById(ticket.event);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (ticket.status === "paid") {
      // Make sure old paid tickets also sync student into event
      await Event.findByIdAndUpdate(ticket.event, {
        $addToSet: { purchasedStudents: studentMongoId },
      });

      await StudentEvent.findOneAndUpdate(
        { student: studentMongoId, event: ticket.event },
        {
          student: studentMongoId,
          event: ticket.event,
          status: "purchased",
          paymentStatus: "approved",
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        message: "Payment already completed",
        ticket,
      });
    }

    ticket.status = "paid";
    await ticket.save();

    await StudentEvent.findOneAndUpdate(
      { student: studentMongoId, event: ticket.event },
      {
        student: studentMongoId,
        event: ticket.event,
        status: "purchased",
        paymentStatus: "approved",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // IMPORTANT: add student to purchasedStudents for feedback eligibility
    await Event.findByIdAndUpdate(ticket.event, {
      $addToSet: { purchasedStudents: studentMongoId },
    });

    return res.status(200).json({
      message: "Payment Purchased",
      ticket,
    });
  } catch (error) {
    console.error("completeDemoPayment error:", error);
    return res.status(500).json({
      message: "Failed to complete payment",
      error: error.message,
    });
  }
}

export async function getMyTickets(req, res) {
  try {
    const studentMongoId = req.user?.sub;

    const tickets = await StudentTicket.find({
      student: studentMongoId,
    })
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("getMyTickets error:", error);
    return res.status(500).json({
      message: "Failed to load tickets",
      error: error.message,
    });
  }
}
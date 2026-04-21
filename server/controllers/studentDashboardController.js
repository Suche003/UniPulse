import Student from "../models/Student.js";
import Event from "../models/Event.js";

/**
 * GET /api/student/dashboard
 * Returns logged-in student info + approved upcoming events
 */
export async function getStudentDashboard(req, res) {
  try {
    const studentId = req.user?.sub;

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const student = await Student.findById(studentId).select(
      "name regNo registrationNo contact phone email"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const now = new Date();

    const events = await Event.find({
      status: "approved",
      date: { $gte: now },
    })
      .sort({ date: 1 })
      .select(
        "eventid clubid title description date location ispaid ticketPrice pdf"
      );

    return res.status(200).json({
      student: {
        name: student.name || "Student",
        regNo: student.regNo || student.registrationNo || "N/A",
        contact: student.contact || student.phone || "N/A",
        email: student.email || "",
      },
      events,
    });
  } catch (error) {
    console.error("getStudentDashboard error:", error);
    return res.status(500).json({
      message: "Failed to load student dashboard",
      error: error.message,
    });
  }
}
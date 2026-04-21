import mongoose from "mongoose";

const studentEventSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    status: {
      type: String,
      enum: ["going", "ticket_requested", "purchased"],
      required: true,
      default: "going",
    },

    paymentStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
  },
  { timestamps: true }
);

studentEventSchema.index({ student: 1, event: 1 }, { unique: true });

export default mongoose.model("StudentEvent", studentEventSchema);
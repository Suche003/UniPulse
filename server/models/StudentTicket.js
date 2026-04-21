import mongoose from "mongoose";

const studentTicketSchema = new mongoose.Schema(
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

    studentIdDisplay: {
      type: String,
      required: true,
      trim: true,
    },

    eventName: {
      type: String,
      required: true,
      trim: true,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      default: 1,
      enum: [1],
    },

    status: {
      type: String,
      enum: ["initiated", "paid", "cancelled"],
      default: "initiated",
    },
  },
  { timestamps: true }
);

studentTicketSchema.index({ student: 1, event: 1 }, { unique: true });

export default mongoose.model("StudentTicket", studentTicketSchema);
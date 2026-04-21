import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventid: { type: String, required: true, unique: true },

    clubid: { type: String, required: true },

    title: {
      type: String,
      required: true,
      minlength: 3,
      match: [/^[A-Za-z0-9\s]+$/, "Title can only contain letters, numbers and spaces"],
    },

    description: {
      type: String,
      maxlength: 1000,
      
    },

    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (val) {
          return new Date(val) > new Date();
        },
        message: "Event date must be in the future",
      },
    },

    location: { type: String, required: true },

    ispaid: { type: Boolean, default: false },

    ticketPrice: {
      type: Number,
      required: function () {
        return this.ispaid;
      },
      min: 0,
    },

    pdf: { type: String, required: true },

    image: { type: String },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rejectReason: {
  type: String,
  default: ""
},
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
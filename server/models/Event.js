import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventid: { type: String, required: true, unique: true },

  clubid: { type: String, required: true },

  title: { type: String, required: true, minlength: 3 , match: [/^[A-Za-z\s]+$/, "Title can only contain letters and spaces"]},

  description: { type: String, maxlength: 1000 ,match: [/^[A-Za-z\s]+$/, "Description can only contain letters and spaces"]},

  date: { 
    type: Date, 
    required: true, 
    validate: { validator: val => val >= new Date(), message: "Event date must be future" }
  },
  location: { type: String, required: true },

  ispaid: { type: Boolean, default: false },

  ticketPrice: { type: Number, required: function(){ return this.ispaid }, min: 0 },

  pdf: { type: String, required: true },

  image: { type: String },

  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" }

}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
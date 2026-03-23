import mongoose from "mongoose";

const stallSchema = new mongoose.Schema(
  {
    eventid: { type: String, required: true },         
    type: { type: String, required: true },           
    price: { type: Number, required: true },

    location: { type: String },        

    availableStalls: { type: Number, required: true },

    image: { type: String },           

    description: { type: String },     

    status: { 
      type: String, 
      enum: ["Available", "Pending", "Booked"], 
      default: "Available" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Stall", stallSchema);
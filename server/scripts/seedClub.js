import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Club from "../models/Club.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const clubData = {
    clubName: "Computer Science Society",
    Username: "CS001",
    email: "csclub@university.edu",
    password: "Club123",
    isActive: true,
  };

  const exists = await Club.findOne({ clubId: clubData.clubId });
  if (exists) {
    console.log("Club already exists");
  } else {
    const passwordHash = await bcrypt.hash(clubData.password, 10);
    await Club.create({ ...clubData, passwordHash });
    console.log("✅ Club created:", clubData);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
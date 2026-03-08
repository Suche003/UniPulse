import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import SuperAdmin from "../models/SuperAdmin.js";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const username = "superadmin";
  const password = "SuperAdmin123"; // change after first login
  const passwordHash = await bcrypt.hash(password, 10);

  const exists = await SuperAdmin.findOne({ username });
  if (exists) {
    console.log("SuperAdmin already exists");
  } else {
    await SuperAdmin.create({ username, passwordHash });
    console.log("✅ SuperAdmin created:", { username, password });
  }

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
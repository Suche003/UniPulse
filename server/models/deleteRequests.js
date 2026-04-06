import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const deleteAllRequests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const result = await mongoose.connection.db.collection('sponsorshiprequests').deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} sponsorship requests`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

deleteAllRequests();
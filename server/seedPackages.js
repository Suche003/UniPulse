import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SponsorshipPackage from './models/SponsorshipPackage.js';

dotenv.config();

const packages = [
  { name: 'Platinum', price: 10000, description: 'Top tier sponsorship', benefits: ['Logo on main banner', 'Social media campaign', 'VIP booth'], isActive: true },
  { name: 'Gold', price: 5000, description: 'High visibility sponsorship', benefits: ['Logo on event page', 'Social media mention'], isActive: true },
  { name: 'Silver', price: 2500, description: 'Mid‑level sponsorship', benefits: ['Name in event program', 'Logo on website'], isActive: true },
  { name: 'Bronze', price: 1000, description: 'Entry‑level sponsorship', benefits: ['Logo on sponsor wall'], isActive: true },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await SponsorshipPackage.deleteMany({}); // optional: clears existing
  await SponsorshipPackage.insertMany(packages);
  console.log('✅ Packages seeded');
  process.exit();
}

seed().catch(err => console.error('❌ Seeding failed:', err));
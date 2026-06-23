import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Event from './models/Event.js';
import Organization from './models/Organization.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eventverse';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Event.deleteMany(), Organization.deleteMany()]);
    console.log('🗑  Cleared existing data');

    // Hash password manually (insertMany bypasses pre-save hooks)
    const hashedPass = await bcrypt.hash('demo123', 10);

    const userDocs = await User.collection.insertMany([
      { name: 'Admin User', email: 'admin@demo.com', password: hashedPass, roles: ['admin', 'student'], activeRole: 'admin', institution: 'EventVerse HQ', isActive: true, onboardingComplete: true, interests: [], achievementPoints: 0, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Alex Johnson', email: 'organizer@demo.com', password: hashedPass, roles: ['organizer', 'student'], activeRole: 'organizer', institution: 'MIT College of Engineering', department: 'Computer Science', year: '3rd Year', interests: ['hackathon', 'ai-ml', 'web-dev'], isActive: true, onboardingComplete: true, achievementPoints: 150, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Priya Sharma', email: 'student@demo.com', password: hashedPass, roles: ['student'], activeRole: 'student', institution: 'VIT University', department: 'ECE', year: '2nd Year', interests: ['ai-ml', 'robotics', 'hackathon', 'web-dev', 'data-science'], isActive: true, onboardingComplete: true, achievementPoints: 80, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const [adminId, organizerId, studentId] = userDocs.insertedIds ? Object.values(userDocs.insertedIds) : [];

    // Create organization
    const org = await Organization.create({
      name: 'Google Developer Student Clubs',
      type: 'club', category: 'technical',
      description: 'GDSC MIT CEG — Building the next generation of developers',
      institution: 'MIT College of Engineering',
      owner: organizerId, isVerified: true,
    });

    // Update organizer user with org ref
    await User.collection.updateOne({ _id: organizerId }, { $set: { organization: org._id } });

    // Create sample events
    const now = new Date();
    const events = [
      {
        title: 'HackFest 2025 — 24hr Hackathon',
        description: 'Join us for the biggest hackathon of the year! Build innovative solutions for real-world problems. Open to all students. Prizes worth ₹50,000.\n\nThemes:\n• HealthTech\n• FinTech\n• EdTech\n• Sustainability',
        category: 'hackathon', mode: 'offline',
        venue: 'MIT Main Auditorium, Block A',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        capacity: 200, registeredCount: 87,
        organizer: organizerId, organization: org._id,
        status: 'published', isFeatured: true,
        tags: ['hackathon', 'coding', 'teamwork', 'prizes', 'beginner-friendly'],
        prizes: ['1st: ₹25,000 + Internship offer', '2nd: ₹15,000 + Goodies', '3rd: ₹10,000 + Certificates'],
      },
      {
        title: 'Flutter & Dart Workshop — Build Your First App',
        description: 'Learn to build beautiful cross-platform mobile apps with Flutter. This hands-on workshop covers:\n• Dart fundamentals\n• Flutter widgets\n• State management\n• Firebase integration\n\nNo prior mobile experience needed!',
        category: 'workshop', mode: 'hybrid',
        venue: 'CS Lab 3, Block B', meetLink: 'https://meet.google.com/abc-defg-hij',
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 60, registeredCount: 45,
        organizer: organizerId, organization: org._id,
        status: 'published',
        tags: ['flutter', 'mobile', 'dart', 'firebase', 'beginner'],
        prizes: [],
      },
      {
        title: 'AI/ML Summit — Future of Intelligence',
        description: 'A full-day seminar featuring talks from industry experts on Artificial Intelligence and Machine Learning. Topics include Large Language Models, Computer Vision, MLOps, and AI Ethics.',
        category: 'seminar', mode: 'online',
        meetLink: 'https://meet.google.com/summit-ai-2025',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        capacity: 500, registeredCount: 234,
        organizer: organizerId, organization: org._id,
        status: 'published', isFeatured: true,
        tags: ['AI', 'ML', 'deep-learning', 'NLP', 'data-science'],
        prizes: [],
      },
      {
        title: 'Web3 & Blockchain Bootcamp',
        description: 'Deep dive into blockchain technology, smart contracts, and decentralized applications. Learn Solidity, deploy on Ethereum testnet, and build your first DApp.',
        category: 'workshop', mode: 'offline',
        venue: 'Innovation Hub, Ground Floor',
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        capacity: 40, registeredCount: 38,
        organizer: organizerId, organization: org._id,
        status: 'published',
        tags: ['blockchain', 'web3', 'solidity', 'ethereum', 'dapp'],
        prizes: [],
      },
      {
        title: 'Cultural Night 2025 — Spotlight',
        description: 'Annual cultural extravaganza featuring music, dance, drama, and art performances from talented students across all departments.',
        category: 'cultural', mode: 'offline',
        venue: 'Open Air Theatre',
        startDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        capacity: 1000, registeredCount: 412,
        organizer: organizerId,
        status: 'published', isFeatured: true,
        tags: ['cultural', 'music', 'dance', 'drama', 'fun'],
        prizes: ['Best Performance: ₹5,000', 'Runner Up: ₹3,000'],
      },
      {
        title: 'NSS Blood Donation Drive',
        description: 'Join the National Service Scheme blood donation camp. Every unit counts. Free health checkup for all donors. Participation certificates provided.',
        category: 'volunteer', mode: 'offline',
        venue: 'College Medical Center',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        capacity: 150, registeredCount: 63,
        organizer: organizerId,
        status: 'published',
        tags: ['volunteer', 'NSS', 'blood-donation', 'community'],
        prizes: [],
      },
    ];

    await Event.insertMany(events);
    console.log('✅ Sample events created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Demo Accounts:');
    console.log('─────────────────────────────');
    console.log('👤 Student:   student@demo.com   / demo123');
    console.log('🎪 Organizer: organizer@demo.com / demo123');
    console.log('⚡ Admin:     admin@demo.com     / demo123');
    console.log('─────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();

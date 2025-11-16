// Script to create an admin user
// Run: node createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./Model/userModel');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.argv[2] || 'admin@pollify.com';
    const adminPassword = process.argv[3] || 'admin123';
    const adminName = process.argv[4] || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ mail: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('To update to admin, you can manually update the role in MongoDB or delete the user first.');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = new User({
      name: adminName,
      mail: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();


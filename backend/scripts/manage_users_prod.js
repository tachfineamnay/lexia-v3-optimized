#!/usr/bin/env node
// manage_users_prod.js
// WARNING: This script will DELETE all users in the target database and create two test accounts.
// Intended to be run in a secure environment where MONGODB_URI is set to the production DB.


require('dotenv').config();
const mongoose = require('mongoose');

const User = require('../models/user');

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      console.error('ERROR: MONGODB_URI / DATABASE_URL not set in environment. Aborting.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Confirm destructive action with environment variable
    const confirm = process.env.CONFIRM_MANAGE_USERS || '';
    if (confirm.toLowerCase() !== 'yes') {
      console.error('Destructive operation not confirmed. Set CONFIRM_MANAGE_USERS=yes in environment to proceed. Aborting.');
      await mongoose.disconnect();
      process.exit(2);
    }

    console.log('Deleting all users from the users collection...');
    const delRes = await User.deleteMany({});
    console.log(`Deleted ${delRes.deletedCount || 0} users`);

    // Default credentials
    const adminEmail = process.env.NEW_ADMIN_EMAIL || 'admin@lexia.test';
    const adminPassword = process.env.NEW_ADMIN_PASSWORD || 'Admin123!';
    const userEmail = process.env.NEW_USER_EMAIL || 'user@lexia.test';
    const userPassword = process.env.NEW_USER_PASSWORD || 'User123!';


    // Do NOT pre-hash the password here. The User model has a pre-save hook that
    // hashes the password. Supplying an already-hashed value causes a double-hash
    // and prevents login with the plain password.

    const now = new Date();

    const adminDoc = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      // store plain password here so pre-save will hash it
      password: adminPassword,
      role: 'admin',
      // userSchema expects isActive and isEmailVerified
      isActive: true,
      isEmailVerified: true,
      createdAt: now
    });

    const userDoc = new User({
      firstName: 'Test',
      lastName: 'User',
      email: userEmail,
      password: userPassword,
      role: 'user',
      isActive: true,
      isEmailVerified: true,
      createdAt: now
    });

    await adminDoc.save();
    await userDoc.save();

    console.log('Successfully created test accounts:');
    console.log(`  Admin -> email: ${adminEmail}  password: ${adminPassword}`);
    console.log(`  User  -> email: ${userEmail}  password: ${userPassword}`);

    await mongoose.disconnect();
    console.log('Disconnected and finished.');
    process.exit(0);
  } catch (err) {
    console.error('Error during manage users script:', err && (err.stack || err.message || err));
    try { await mongoose.disconnect(); } catch(e){}
    process.exit(1);
  }
})();

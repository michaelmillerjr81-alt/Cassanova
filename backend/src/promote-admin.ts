import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cassanova';

async function promoteAdmin() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error('Usage: npm run promote-admin <username-or-email>');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      console.error(`User "${identifier}" not found`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`${user.username} (${user.email}) is already an admin`);
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`Promoted ${user.username} (${user.email}) to admin`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

promoteAdmin();

const mongoose = require('mongoose');
const User = require('../modules/auth/user.model');
require('dotenv').config();

const seedUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@stdmng.com',
    password: 'Admin123@',
    role: 'admin',
    isEmailVerified: true,
    profile: {
      phone: '+1234567890',
      gender: 'Nam',
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
      }
    }
  },
  {
    firstName: 'Teacher',
    lastName: 'User',
    email: 'teacher@stdmng.com',
    password: 'Teacher123!',
    role: 'teacher',
    isEmailVerified: true,
    profile: {
      phone: '+1234567891',
      gender: 'Nữ',
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
      }
    }
  },
  {
    firstName: 'Student',
    lastName: 'User',
    email: 'student@stdmng.com',
    password: 'Student!',
    role: 'student',
    isEmailVerified: true,
    profile: {
      phone: '+1234567892',
      gender: 'Nam',
      preferences: {
        notifications: {
          email: true,
          push: false,
          sms: false
        },
      }
    }
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create seed users
    const createdUsers = await User.create(seedUsers);
    console.log(`Created ${createdUsers.length} seed users`);

    // Display created users
    createdUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}: ${user.email} (${user.fullName})`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run seeding
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase };

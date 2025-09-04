const mongoose = require('mongoose');
const User = require('../modules/user/user.model');
require('dotenv').config();

const seedUsers = [
  {
    firstName: 'Admin',
    lastName: 'Dương',
    email: 'admin@stdmng.com',
    password: 'Admin123!',
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
    firstName: 'Giáo viên',
    lastName: 'Giang',
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
    firstName: 'Học sinh',
    lastName: 'Đức',
    email: 'student@stdmng.com',
    password: 'Student123!',
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
    console.log('Đã kết nối MongoDB');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await User.deleteMany({});
    console.log('Xoá dữ liệu đang có');

    const createdUsers = await User.create(seedUsers);
    console.log(`Đã tạo ${createdUsers.length} người dùng`);

    createdUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}: ${user.email} (${user.fullName})`);
    });

    console.log('\nTạo dữ liệu mẫu thành công!');
    console.log('\Thông tin:');
    console.log('Admin: admin@stdmng.com / Admin123!');
    console.log('Teacher: teacher@stdmng.com / Teacher123!');
    console.log('Student: student@stdmng.com / Student123!');

  } catch (error) {
    console.error('Lỗi tạo dữ liệu mẫu:', error);
  } finally {
    mongoose.connection.close();
    console.log('Đóng kết nối MongoDB');
  }
};

if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase };

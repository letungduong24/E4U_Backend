const mongoose = require('mongoose');
const User = require('../models/user.model');
const Class = require('../models/class.model');
const StudentClass = require('../models/student_class.model');
require('dotenv').config();

const seedUsers = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@stdmng.com',
    password: 'Admin123@',
    role: 'admin',
    profile: {
      phone: '+1234567890',
      gender: 'Nam',
      notification: true
    }
  },
  // Teachers
  {
    firstName: 'Nguyễn',
    lastName: 'Văn An',
    email: 'teacher1@stdmng.com',
    password: 'Teacher123!',
    role: 'teacher',
    profile: {
      phone: '+1234567891',
      gender: 'Nam',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Trần',
    lastName: 'Thị Bình',
    email: 'teacher2@stdmng.com',
    password: 'Teacher123!',
    role: 'teacher',
    profile: {
      phone: '+1234567892',
      gender: 'Nữ',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      notification: true
    }
  },
  // Students
  {
    firstName: 'Lê',
    lastName: 'Văn Cường',
    email: 'student1@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567893',
      gender: 'Nam',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Phạm',
    lastName: 'Thị Dung',
    email: 'student2@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567894',
      gender: 'Nữ',
      address: '321 Đường GHI, Quận 4, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Hoàng',
    lastName: 'Văn Em',
    email: 'student3@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567895',
      gender: 'Nam',
      address: '654 Đường JKL, Quận 5, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Vũ',
    lastName: 'Thị Phương',
    email: 'student4@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567896',
      gender: 'Nữ',
      address: '987 Đường MNO, Quận 6, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Đặng',
    lastName: 'Văn Quang',
    email: 'student5@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567897',
      gender: 'Nam',
      address: '147 Đường PQR, Quận 7, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Bùi',
    lastName: 'Thị Rinh',
    email: 'student6@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567898',
      gender: 'Nữ',
      address: '258 Đường STU, Quận 8, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Ngô',
    lastName: 'Văn Sơn',
    email: 'student7@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567899',
      gender: 'Nam',
      address: '369 Đường VWX, Quận 9, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Đinh',
    lastName: 'Thị Tuyết',
    email: 'student8@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567800',
      gender: 'Nữ',
      address: '741 Đường YZA, Quận 10, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Lý',
    lastName: 'Văn Uyên',
    email: 'student9@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567801',
      gender: 'Nam',
      address: '852 Đường BCD, Quận 11, TP.HCM',
      notification: true
    }
  },
  {
    firstName: 'Hồ',
    lastName: 'Thị Vân',
    email: 'student10@stdmng.com',
    password: 'Student123!',
    role: 'student',
    profile: {
      phone: '+1234567802',
      gender: 'Nữ',
      address: '963 Đường EFG, Quận 12, TP.HCM',
      notification: true
    }
  }
];

const seedClasses = [
  {
    name: 'IELTS Foundation - Band 4.0-5.5',
    code: 'IELTS-FOUNDATION',
    description: 'Lớp IELTS Foundation dành cho học viên mới bắt đầu, mục tiêu đạt band 4.0-5.5',
    maxStudents: 20,
    isActive: true
  },
  {
    name: 'IELTS Advanced - Band 6.0-7.5',
    code: 'IELTS-ADVANCED',
    description: 'Lớp IELTS Advanced dành cho học viên có nền tảng, mục tiêu đạt band 6.0-7.5',
    maxStudents: 15,
    isActive: true
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
    // Clear existing data
    await User.deleteMany({});
    await Class.deleteMany({});
    await StudentClass.deleteMany({});
    console.log('Cleared existing data');

    // Create seed users
    const createdUsers = await User.create(seedUsers);
    console.log(`Created ${createdUsers.length} seed users`);

    // Get teachers and students
    const teachers = createdUsers.filter(user => user.role === 'teacher');
    const students = createdUsers.filter(user => user.role === 'student');

    // Create classes with teacher assignments
    const classesWithTeachers = seedClasses.map((classData, index) => ({
      ...classData,
      homeroomTeacher: teachers[index % teachers.length]._id
    }));

    const createdClasses = await Class.create(classesWithTeachers);
    console.log(`Created ${createdClasses.length} seed classes`);

    // Assign students to classes
    const class1 = createdClasses[0];
    const class2 = createdClasses[1];
    
    // Assign first 5 students to class 1
    const studentsClass1 = students.slice(0, 5);
    const studentsClass2 = students.slice(5, 10);

    // Create StudentClass records for class 1
    const studentClassRecords1 = [];
    for (const student of studentsClass1) {
      const studentClassRecord = await StudentClass.create({
        student: student._id,
        class: class1._id,
        status: 'enrolled',
        enrolledAt: new Date()
      });
      studentClassRecords1.push(studentClassRecord);
      
      // Update student's current class and enrollment history
      student.currentClass = class1._id;
      student.enrollmentHistory.push(studentClassRecord._id);
      await student.save();
    }

    // Create StudentClass records for class 2
    const studentClassRecords2 = [];
    for (const student of studentsClass2) {
      const studentClassRecord = await StudentClass.create({
        student: student._id,
        class: class2._id,
        status: 'enrolled',
        enrolledAt: new Date()
      });
      studentClassRecords2.push(studentClassRecord);
      
      // Update student's current class and enrollment history
      student.currentClass = class2._id;
      student.enrollmentHistory.push(studentClassRecord._id);
      await student.save();
    }

    // Update class enrollments
    class1.students = studentsClass1.map(s => s._id);
    class1.enrollments = studentClassRecords1.map(sc => sc._id);
    await class1.save();

    class2.students = studentsClass2.map(s => s._id);
    class2.enrollments = studentClassRecords2.map(sc => sc._id);
    await class2.save();

    // Update teacher teaching classes
    teachers[0].teachingClass = class1._id;
    teachers[1].teachingClass = class2._id;
    await teachers[0].save();
    await teachers[1].save();

    console.log(`\n📝 Created ${studentClassRecords1.length + studentClassRecords2.length} StudentClass records`);
    console.log('📝 Students assigned to classes successfully!');

    // Display created data
    console.log('\n📊 SEED DATA SUMMARY:');
    console.log('='.repeat(50));
    
    createdUsers.forEach(user => {
      console.log(`👤 ${user.role.toUpperCase()}: ${user.email} (${user.fullName})`);
    });

    console.log('\n🏫 CLASSES:');
    createdClasses.forEach(cls => {
      console.log(`📚 ${cls.name} (${cls.code}) - Teacher: ${cls.homeroomTeacher}`);
      console.log(`   Students: ${cls.students.length}/${cls.maxStudents} students`);
      console.log(`   Enrollments: ${cls.enrollments.length} StudentClass records`);
      console.log(`   Description: ${cls.description}`);
    });

    console.log('\n📋 STUDENT-CLASS ENROLLMENTS:');
    const allStudentClasses = await StudentClass.find({})
      .populate('student', 'firstName lastName email')
      .populate('class', 'name code');
    
    allStudentClasses.forEach(sc => {
      console.log(`👤 ${sc.student.firstName} ${sc.student.lastName} → 📚 ${sc.class.name} (${sc.class.code}) - Status: ${sc.status}`);
    });



    console.log('\n✅ Database seeded successfully!');


    const Schedule = require('../models/schedule.model');
    // Create schedules for classes
    console.log('\n📅 Creating schedules for classes...')
    const seedSchedules = [
        {
          class: class1._id,  
          day: "2025-09-08",
          period: "08:00-09:00"
        },
        {
          class: class2._id,
          day: "2025-09-09",
          period: "08:00-09:00",
        }
      ];
      await Schedule.deleteMany({});
      for (const schedData of seedSchedules) {
        const schedule = await Schedule.create(schedData);
        console.log(`   Created schedule for class ${schedData.class} on ${schedData.day} at ${schedData.period}`);
        await schedule.save();
        console.log(`   Created period for schedule ${schedule._id}`);
      }
      console.log('✅ Schedules created successfully!');

      const Homework = require('../models/homework.model');
    // Create schedules for classes
    console.log('\n📅 Creating homeworks for classes...')
    const seedHomeworks = [
        {
            title: "BT1",
            description: "Bài tập thì quá khứ đơn",
            classId: "68bbf5293fdcd59a9429ce2a",
            deadline: "2026-06-07",
            file: {
              fileName: "baitap1.pdf",
              filePath: "./src/hw/1.pdf"
            },
            teacherId: teachers[0]._id
        },
        {
            title: "BT2",
            description: "Bài tập thì quá khứ đơn",
            classId: "68bbf5293fdcd59a9429ce2a",
            deadline: "2026-06-07",
            file: {
              fileName: "baitap2.pdf",
              filePath: "./src/hw/2.pdf"
            },
            teacherId: teachers[1]._id
        }
      ];
      await Homework.deleteMany({});
      for (const homeworkData of seedHomeworks) {
        const homework = await Homework.create(homeworkData);
        console.log(`Created homework for class ${homeworkData.classId} with deadline ${homeworkData.deadline}`);
        await homework.save();
      }
      console.log('✅ Homeworks created successfully!');


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

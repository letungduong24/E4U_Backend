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
    // Import all models first
    const Schedule = require('../models/schedule.model');
    const Homework = require('../models/homework.model');
    const Document = require('../models/document.model');
    const Submission = require('../models/submission.model');

    // Clear existing data (order matters due to references)
    console.log('🗑️  Clearing existing data...');
    await Submission.deleteMany({});
    await Homework.deleteMany({});
    await Document.deleteMany({});
    await Schedule.deleteMany({});
    await StudentClass.deleteMany({});
    await Class.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Cleared existing data');

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
      
      // Update student's current class
      student.currentClass = class1._id;
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
      
      // Update student's current class
      student.currentClass = class2._id;
      await student.save();
    }

    // Update class students
    class1.students = studentsClass1.map(s => s._id);
    await class1.save();

    class2.students = studentsClass2.map(s => s._id);
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
      console.log(`   Description: ${cls.description}`);
    });

    console.log('\n📋 STUDENT-CLASS ENROLLMENTS:');
    const allStudentClasses = await StudentClass.find({})
      .populate('student', 'firstName lastName email')
      .populate('class', 'name code');
    
    allStudentClasses.forEach(sc => {
      console.log(`👤 ${sc.student.firstName} ${sc.student.lastName} → 📚 ${sc.class.name} (${sc.class.code}) - Status: ${sc.status}`);
    });

    // Calculate dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    // Helper function to format date as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Get future dates for schedules
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    // Create schedules for classes
    console.log('\n📅 Creating schedules for classes...');
    
    const seedSchedules = [
      // Class 1 - Future schedules
      {
        class: class1._id,
        day: formatDate(tomorrow),
        period: "08:00-09:00",
        isDone: false
      },
      {
        class: class1._id,
        day: formatDate(tomorrow),
        period: "09:10-10:10",
        isDone: false
      },
      {
        class: class1._id,
        day: formatDate(dayAfterTomorrow),
        period: "10:20-11:20",
        isDone: false
      },
      {
        class: class1._id,
        day: formatDate(nextWeek),
        period: "15:00-16:00",
        isDone: false
      },
      // Class 2 - Future schedules
      {
        class: class2._id,
        day: formatDate(tomorrow),
        period: "13:50-14:50",
        isDone: false
      },
      {
        class: class2._id,
        day: formatDate(dayAfterTomorrow),
        period: "15:00-16:00",
        isDone: false
      },
      {
        class: class2._id,
        day: formatDate(nextWeek),
        period: "16:10-17:10",
        isDone: false
      },
      // Past schedules (for testing)
      {
        class: class1._id,
        day: formatDate(lastWeek),
        period: "08:00-09:00",
        isDone: true
      },
      {
        class: class2._id,
        day: formatDate(lastWeek),
        period: "09:10-10:10",
        isDone: true
      }
    ];

    const createdSchedules = await Schedule.insertMany(seedSchedules);
    console.log(`✅ Created ${createdSchedules.length} schedules`);

    // Create homeworks for classes
    console.log('\n📝 Creating homeworks for classes...');
    
    const seedHomeworks = [
      {
        title: "Bài tập Grammar - Thì quá khứ đơn",
        description: "Hoàn thành bài tập về thì quá khứ đơn trong sách giáo khoa trang 45-50. Nộp bài trước deadline.",
        classId: class1._id,
        deadline: nextWeek,
        file: {
          fileName: "baitap_grammar_qua_khu_don.pdf",
          filePath: "/uploads/homeworks/baitap_grammar_qua_khu_don.pdf"
        },
        teacherId: teachers[0]._id
      },
      {
        title: "Bài tập Listening - Section 1-2",
        description: "Nghe và trả lời câu hỏi trong bài nghe Listening Test 1. Viết câu trả lời ra giấy và nộp.",
        classId: class1._id,
        deadline: nextMonth,
        file: {
          fileName: "baitap_listening_section_1_2.pdf",
          filePath: "/uploads/homeworks/baitap_listening_section_1_2.pdf"
        },
        teacherId: teachers[0]._id
      },
      {
        title: "Bài tập Reading Comprehension",
        description: "Đọc đoạn văn và trả lời các câu hỏi trắc nghiệm. Tối thiểu đạt 80% điểm để đạt yêu cầu.",
        classId: class2._id,
        deadline: nextWeek,
        file: {
          fileName: "baitap_reading_comprehension.pdf",
          filePath: "/uploads/homeworks/baitap_reading_comprehension.pdf"
        },
        teacherId: teachers[1]._id
      },
      {
        title: "Bài tập Writing - Opinion Essay",
        description: "Viết một bài opinion essay với chủ đề về giáo dục trực tuyến. Độ dài tối thiểu 250 từ.",
        classId: class2._id,
        deadline: nextMonth,
        file: {
          fileName: "baitap_writing_opinion_essay.pdf",
          filePath: "/uploads/homeworks/baitap_writing_opinion_essay.pdf"
        },
        teacherId: teachers[1]._id
      },
      {
        title: "Bài tập Vocabulary - Unit 5",
        description: "Học thuộc 50 từ vựng mới trong Unit 5 và làm bài tập điền từ vào chỗ trống.",
        classId: class1._id,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        file: {
          fileName: "baitap_vocabulary_unit_5.pdf",
          filePath: "/uploads/homeworks/baitap_vocabulary_unit_5.pdf"
        },
        teacherId: teachers[0]._id
      }
    ];

    const createdHomeworks = await Homework.insertMany(seedHomeworks);
    console.log(`✅ Created ${createdHomeworks.length} homeworks`);

    // Create documents for classes
    console.log('\n📄 Creating documents for classes...');
    
    const seedDocuments = [
      {
        title: "Tài liệu Grammar - Thì quá khứ đơn",
        description: "Tài liệu tổng hợp về thì quá khứ đơn trong tiếng Anh, bao gồm công thức, cách sử dụng và ví dụ minh họa.",
        classId: class1._id,
        teacherId: teachers[0]._id,
        file: {
          fileName: "tailieu_grammar_qua_khu_don.pdf",
          filePath: "/uploads/documents/tailieu_grammar_qua_khu_don.pdf"
        },
        isActive: true
      },
      {
        title: "Tài liệu Listening Tips & Strategies",
        description: "Hướng dẫn chi tiết về các kỹ thuật nghe hiểu tiếng Anh, bao gồm cách làm bài thi IELTS Listening.",
        classId: class1._id,
        teacherId: teachers[0]._id,
        file: {
          fileName: "tailieu_listening_tips_strategies.pdf",
          filePath: "/uploads/documents/tailieu_listening_tips_strategies.pdf"
        },
        isActive: true
      },
      {
        title: "Tài liệu Reading Strategies - IELTS",
        description: "Tài liệu về các chiến lược đọc hiểu trong bài thi IELTS, cách tìm thông tin nhanh và chính xác.",
        classId: class2._id,
        teacherId: teachers[1]._id,
        file: {
          fileName: "tailieu_reading_strategies_ielts.pdf",
          filePath: "/uploads/documents/tailieu_reading_strategies_ielts.pdf"
        },
        isActive: true
      },
      {
        title: "Tài liệu Writing - Opinion Essay Structure",
        description: "Cấu trúc và cách viết một bài opinion essay trong IELTS Writing Task 2.",
        classId: class2._id,
        teacherId: teachers[1]._id,
        file: {
          fileName: "tailieu_writing_opinion_essay_structure.pdf",
          filePath: "/uploads/documents/tailieu_writing_opinion_essay_structure.pdf"
        },
        isActive: true
      },
      {
        title: "Tài liệu Vocabulary - Business English",
        description: "Từ vựng tiếng Anh thương mại phổ biến, kèm theo ví dụ sử dụng trong ngữ cảnh thực tế.",
        classId: class1._id,
        teacherId: teachers[0]._id,
        file: {
          fileName: "tailieu_vocabulary_business_english.pdf",
          filePath: "/uploads/documents/tailieu_vocabulary_business_english.pdf"
        },
        isActive: true
      },
      {
        title: "Tài liệu Speaking - Common Topics",
        description: "Các chủ đề thường gặp trong IELTS Speaking Part 1, Part 2 và Part 3, kèm câu trả lời mẫu.",
        classId: class2._id,
        teacherId: teachers[1]._id,
        file: {
          fileName: "tailieu_speaking_common_topics.pdf",
          filePath: "/uploads/documents/tailieu_speaking_common_topics.pdf"
        },
        isActive: true
      }
    ];

    const createdDocuments = await Document.insertMany(seedDocuments);
    console.log(`✅ Created ${createdDocuments.length} documents`);

    // Create submissions for homeworks
    console.log('\n📤 Creating submissions for homeworks...');
    
    const seedSubmissions = [];
    
    // Some students submit homework 1 (class 1)
    if (createdHomeworks[0] && studentsClass1.length > 0) {
      for (let i = 0; i < Math.min(3, studentsClass1.length); i++) {
        const submission = await Submission.create({
          homeworkId: createdHomeworks[0]._id,
          studentId: studentsClass1[i]._id,
          file: `/uploads/submissions/homework_${createdHomeworks[0]._id}_student_${studentsClass1[i]._id}.pdf`,
          status: i === 0 ? 'graded' : 'submitted', // First one is graded
          grade: i === 0 ? 85 : undefined,
          feedback: i === 0 ? 'Bài làm tốt, cần cải thiện phần ngữ pháp' : undefined,
          gradedAt: i === 0 ? new Date() : undefined
        });
        seedSubmissions.push(submission);
      }
    }

    // Some students submit homework 2 (class 1)
    if (createdHomeworks[1] && studentsClass1.length > 0) {
      for (let i = 1; i < Math.min(3, studentsClass1.length); i++) {
        const submission = await Submission.create({
          homeworkId: createdHomeworks[1]._id,
          studentId: studentsClass1[i]._id,
          file: `/uploads/submissions/homework_${createdHomeworks[1]._id}_student_${studentsClass1[i]._id}.pdf`,
          status: 'submitted'
        });
        seedSubmissions.push(submission);
      }
    }

    // Some students submit homework 3 (class 2)
    if (createdHomeworks[2] && studentsClass2.length > 0) {
      for (let i = 0; i < Math.min(4, studentsClass2.length); i++) {
        const submission = await Submission.create({
          homeworkId: createdHomeworks[2]._id,
          studentId: studentsClass2[i]._id,
          file: `/uploads/submissions/homework_${createdHomeworks[2]._id}_student_${studentsClass2[i]._id}.pdf`,
          status: i === 0 ? 'graded' : 'submitted',
          grade: i === 0 ? 92 : undefined,
          feedback: i === 0 ? 'Excellent work! Keep it up.' : undefined,
          gradedAt: i === 0 ? new Date() : undefined
        });
        seedSubmissions.push(submission);
      }
    }

    console.log(`✅ Created ${seedSubmissions.length} submissions`);

    // Display summary
    console.log('\n📊 COMPLETE SEED DATA SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Users: ${createdUsers.length}`);
    console.log(`   - Admin: ${createdUsers.filter(u => u.role === 'admin').length}`);
    console.log(`   - Teachers: ${createdUsers.filter(u => u.role === 'teacher').length}`);
    console.log(`   - Students: ${createdUsers.filter(u => u.role === 'student').length}`);
    console.log(`✅ Classes: ${createdClasses.length}`);
    console.log(`✅ Schedules: ${createdSchedules.length}`);
    console.log(`✅ Homeworks: ${createdHomeworks.length}`);
    console.log(`✅ Documents: ${createdDocuments.length}`);
    console.log(`✅ Submissions: ${seedSubmissions.length}`);
    console.log('\n✅ Database seeded successfully with all features!');


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

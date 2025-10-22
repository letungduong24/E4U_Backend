const User = require('../models/user.model');
const ClassModel = require('../models/class.model');
const StudentClass = require('../models/student_class.model');

// Class management
const createClass = async (payload) => {
  const { name, code, description, homeroomTeacher, students = [], maxStudents = 30, isActive = true } = payload;
  
  // Validate teacher
  const teacher = await User.findById(homeroomTeacher);
  if (!teacher) throw new Error('Homeroom teacher not found');
  if (teacher.role !== 'teacher') throw new Error('User is not a teacher');
  
  // Validate students (if provided)
  if (students.length > 0) {
    const studentDocs = await User.find({ _id: { $in: students } });
    const invalidStudents = studentDocs.filter(s => s.role !== 'student');
    if (invalidStudents.length > 0) {
      throw new Error('Some users are not students');
    }
  }
  
  const classDoc = await ClassModel.create({
    name,
    code,
    description,
    homeroomTeacher,
    students,
    maxStudents,
    isActive
  });
  return classDoc;
};

const listClasses = async ({ teacher, q }) => {
  const query = {};
  if (teacher) query.homeroomTeacher = teacher;
  if (q) query.$or = [{ name: new RegExp(q, 'i') }, { code: new RegExp(q, 'i') }];
  
  const classes = await ClassModel.find(query)
    .populate('homeroomTeacher', 'firstName lastName email role')
    .sort({ createdAt: -1 });
  
  return classes;
};

const getClassById = async (classId) => {
  const cls = await ClassModel.findById(classId)
    .populate('homeroomTeacher', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');
  return cls;
};


const updateClass = async (classId, updateData) => {
  // Validate teacher if being updated
  if (updateData.homeroomTeacher) {
    const teacher = await User.findById(updateData.homeroomTeacher);
    if (!teacher) throw new Error('Homeroom teacher not found');
    if (teacher.role !== 'teacher') throw new Error('User is not a teacher');
  }
  
  const allowed = ['name', 'code', 'description', 'homeroomTeacher', 'maxStudents', 'isActive'];
  const payload = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) payload[key] = updateData[key];
  }
  const cls = await ClassModel.findByIdAndUpdate(classId, payload, { new: true, runValidators: true })
    .populate('homeroomTeacher', 'firstName lastName email role')
    .populate('students', 'firstName lastName email role');
  if (!cls) throw new Error('Class not found');
  return cls;
};

const deleteClass = async (classId) => {
  const cls = await ClassModel.findByIdAndDelete(classId);
  if (!cls) throw new Error('Class not found');
  return { message: 'Class deleted' };
};

const addStudents = async (classId, studentIds = []) => {
  // Validate class exists
  const cls = await ClassModel.findById(classId);
  if (!cls) throw new Error('Class not found');
  
  // Validate all users are students
  const users = await User.find({ _id: { $in: studentIds } }, '_id role');
  const invalidUsers = users.filter(u => u.role !== 'student');
  if (invalidUsers.length > 0) {
    throw new Error('Some users are not students');
  }
  
  const existingIds = users.map(s => s._id);
  
  // Check class capacity
  const currentEnrollments = await StudentClass.countDocuments({ 
    class: classId, 
    status: 'enrolled' 
  });
  if (currentEnrollments + existingIds.length > cls.maxStudents) {
    throw new Error('Adding these students would exceed class capacity');
  }
  
  // Create StudentClass records for each student
  const studentClassRecords = [];
  for (const studentId of existingIds) {
    // Check if student already enrolled
    const existingEnrollment = await StudentClass.findOne({ 
      student: studentId, 
      class: classId 
    });
    
    if (existingEnrollment) {
      if (existingEnrollment.status === 'enrolled') {
        continue; // Skip already enrolled students
      }
      // Re-enroll if dropped
      existingEnrollment.status = 'enrolled';
      existingEnrollment.enrolledAt = new Date();
      existingEnrollment.droppedAt = null;
      await existingEnrollment.save();
      studentClassRecords.push(existingEnrollment);
    } else {
      // Check if student has active enrollment elsewhere
      const currentEnrollment = await StudentClass.findOne({ 
        student: studentId, 
        status: 'enrolled' 
      });
      if (currentEnrollment) {
        throw new Error(`Student ${studentId} is already enrolled in another class`);
      }
      
      // Create new enrollment
      const enrollment = await StudentClass.create({
        student: studentId,
        class: classId,
        status: 'enrolled',
        enrolledAt: new Date()
      });
      studentClassRecords.push(enrollment);
    }
    
    // Update student's current class and enrollment history
    const lastRecord = studentClassRecords[studentClassRecords.length - 1];
    await User.findByIdAndUpdate(studentId, {
      currentClass: classId,
      $addToSet: { enrollmentHistory: lastRecord._id }
    });
  }
  
  // Update class with students and enrollments
  const enrollmentIds = studentClassRecords.map(sc => sc._id);
  const updatedClass = await ClassModel.findByIdAndUpdate(
    classId,
    { 
      $addToSet: { 
        students: { $each: existingIds },
        enrollments: { $each: enrollmentIds }
      } 
    },
    { new: true }
  ).populate('homeroomTeacher', 'firstName lastName email role')
   .populate('students', 'firstName lastName email role');

  return updatedClass;
};

const removeStudents = async (classId, studentIds = []) => {
  // Validate class exists
  const cls = await ClassModel.findById(classId);
  if (!cls) throw new Error('Class not found');
  
  // Update StudentClass records to dropped status
  const enrollments = await StudentClass.find({ 
    class: classId, 
    student: { $in: studentIds },
    status: 'enrolled'
  });
  
  for (const enrollment of enrollments) {
    enrollment.status = 'dropped';
    enrollment.droppedAt = new Date();
    await enrollment.save();
    
    // Remove current class from student
    await User.findByIdAndUpdate(enrollment.student, {
      $unset: { currentClass: 1 }
    });
  }
  
  // Remove students from class
  const updatedClass = await ClassModel.findByIdAndUpdate(
    classId,
    { $pull: { students: { $in: studentIds } } },
    { new: true }
  ).populate('homeroomTeacher', 'firstName lastName email role')
   .populate('students', 'firstName lastName email role');

  return updatedClass;
};

// Set teaching class for teacher
const setTeacherClass = async (teacherId, classId) => {
  // Validate teacher exists and is a teacher
  const teacher = await User.findById(teacherId);
  if (!teacher) throw new Error('Teacher not found');
  if (teacher.role !== 'teacher') throw new Error('User is not a teacher');
  
  // Check if teacher already has a teaching class
  if (teacher.teachingClass) {
    throw new Error('Teacher is already assigned to a class. Please remove from current class first.');
  }
  
  // Validate class exists
  const classDoc = await ClassModel.findById(classId);
  if (!classDoc) throw new Error('Class not found');
  if (!classDoc.isActive) throw new Error('Class is not active');
  
  // Check if class already has a homeroom teacher
  if (classDoc.homeroomTeacher && classDoc.homeroomTeacher.toString() !== teacherId) {
    throw new Error('Class already has a homeroom teacher');
  }
  
  // Update teacher's teaching class
  const updatedTeacher = await User.findByIdAndUpdate(
    teacherId,
    { teachingClass: classId },
    { new: true, runValidators: true }
  )
    .select('-password')
    .populate({
      path: 'currentClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'teachingClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'enrollmentHistory',
      select: 'status enrolledAt completedAt droppedAt notes',
      populate: {
        path: 'class',
        select: 'name code description homeroomTeacher maxStudents isActive',
        populate: {
          path: 'homeroomTeacher',
          select: 'firstName lastName email'
        }
      }
    });
  
  // Update class homeroom teacher
  await ClassModel.findByIdAndUpdate(classId, {
    homeroomTeacher: teacherId
  });
  
  return updatedTeacher;
};

// Remove teacher from class
const removeTeacherFromClass = async (teacherId) => {
  // Validate teacher exists
  const teacher = await User.findById(teacherId);
  if (!teacher) throw new Error('Teacher not found');
  if (teacher.role !== 'teacher') throw new Error('User is not a teacher');
  
  if (!teacher.teachingClass) {
    throw new Error('Teacher is not assigned to any class');
  }
  
  // Remove teacher from class
  await ClassModel.findByIdAndUpdate(teacher.teachingClass, {
    $unset: { homeroomTeacher: 1 }
  });
  
  // Remove teaching class from teacher
  const updatedTeacher = await User.findByIdAndUpdate(
    teacherId,
    { $unset: { teachingClass: 1 } },
    { new: true, runValidators: true }
  )
    .select('-password')
    .populate({
      path: 'currentClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'teachingClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'enrollmentHistory',
      select: 'status enrolledAt completedAt droppedAt notes',
      populate: {
        path: 'class',
        select: 'name code description homeroomTeacher maxStudents isActive',
        populate: {
          path: 'homeroomTeacher',
          select: 'firstName lastName email'
        }
      }
    });
  
  return updatedTeacher;
};

// Get teachers without assigned classes
const getUnassignedTeachers = async () => {
  const teachers = await User.find({
    role: 'teacher',
    teachingClass: { $exists: false }
  })
    .select('-password')
    .populate({
      path: 'currentClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'teachingClass',
      select: 'name code description homeroomTeacher isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName'
      }
    })
    .populate({
      path: 'enrollmentHistory',
      select: 'status enrolledAt completedAt droppedAt notes',
      populate: {
        path: 'class',
        select: 'name code description homeroomTeacher maxStudents isActive',
        populate: {
          path: 'homeroomTeacher',
          select: 'firstName lastName email'
        }
      }
    })
    .sort({ createdAt: -1 });
  
  return teachers;
};

// Get classes without homeroom teachers
const getClassesWithoutTeacher = async () => {
  const classes = await ClassModel.find({
    $or: [
      { homeroomTeacher: { $exists: false } },
      { homeroomTeacher: null }
    ],
    isActive: true
  })
    .populate('homeroomTeacher', 'firstName lastName email role')
    .populate('students', 'firstName lastName email role')
    .sort({ createdAt: -1 });
  
  return classes;
};

module.exports = {
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudents,
  removeStudents,
  // Homeroom teacher management
  setTeacherClass,
  removeTeacherFromClass,
  getUnassignedTeachers,
  getClassesWithoutTeacher
};

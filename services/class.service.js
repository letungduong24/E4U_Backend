const User = require('../models/user.model');
const ClassModel = require('../models/class.model');
const StudentClass = require('../models/student_class.model');

// Class management
const createClass = async (payload) => {
  const { name, code, description, maxStudents = 30, isActive = true } = payload;
  
  const classDoc = await ClassModel.create({
    name,
    code,
    description,
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

const addStudent = async (classId, studentId) => {
  // Validate class exists
  const cls = await ClassModel.findById(classId);
  if (!cls) throw new Error('Class not found');
  
  // Validate user is a student
  const user = await User.findById(studentId);
  if (!user) throw new Error('Student not found');
  if (user.role !== 'student') {
    throw new Error('User is not a student');
  }
  
  // Check class capacity
  const currentEnrollments = await StudentClass.countDocuments({ 
    class: classId, 
    status: 'enrolled' 
  });
  if (currentEnrollments >= cls.maxStudents) {
    throw new Error('Class is at maximum capacity');
  }
  
  // Check if student already enrolled
  const existingEnrollment = await StudentClass.findOne({ 
    student: studentId, 
    class: classId 
  });
  
  if (existingEnrollment) {
    if (existingEnrollment.status === 'enrolled') {
      throw new Error('Student is already enrolled in this class');
    }
    // Re-enroll if dropped
    existingEnrollment.status = 'enrolled';
    existingEnrollment.enrolledAt = new Date();
    existingEnrollment.droppedAt = null;
    await existingEnrollment.save();
  } else {
    // Check if student has active enrollment elsewhere
    const currentEnrollment = await StudentClass.findOne({ 
      student: studentId, 
      status: 'enrolled' 
    });
    if (currentEnrollment) {
      throw new Error('Student is already enrolled in another class');
    }
    
    // Create new enrollment
    const enrollment = await StudentClass.create({
      student: studentId,
      class: classId,
      status: 'enrolled',
      enrolledAt: new Date()
    });
    
    // Update student's current class and enrollment history
    await User.findByIdAndUpdate(studentId, {
      currentClass: classId,
      $addToSet: { enrollmentHistory: enrollment._id }
    });
    
    // Update class with student and enrollment
    await ClassModel.findByIdAndUpdate(
      classId,
      { 
        $addToSet: { 
          students: studentId,
          enrollments: enrollment._id
        } 
      }
    );
  }
  
  // Return updated class with populated data
  const updatedClass = await ClassModel.findById(classId)
    .populate('homeroomTeacher', 'firstName lastName email role')
    .populate('students', 'firstName lastName email role');

  return updatedClass;
};

const removeStudent = async (classId, studentId) => {
  // Validate class exists
  const cls = await ClassModel.findById(classId);
  if (!cls) throw new Error('Class not found');
  
  // Find enrollment record
  const enrollment = await StudentClass.findOne({ 
    class: classId, 
    student: studentId,
    status: 'enrolled'
  });
  
  if (!enrollment) {
    throw new Error('Student is not enrolled in this class');
  }
  
  // Update enrollment to dropped status
  enrollment.status = 'dropped';
  enrollment.droppedAt = new Date();
  await enrollment.save();
  
  // Remove current class from student
  await User.findByIdAndUpdate(studentId, {
    $unset: { currentClass: 1 }
  });
  
  // Remove student from class
  const updatedClass = await ClassModel.findByIdAndUpdate(
    classId,
    { $pull: { students: studentId } },
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
  
  // Update class homeroom teacher and get updated class
  const updatedClass = await ClassModel.findByIdAndUpdate(
    classId, 
    { homeroomTeacher: teacherId },
    { new: true, runValidators: true }
  )
    .populate('homeroomTeacher', 'firstName lastName email role')
    .populate('students', 'firstName lastName email role');
  
  return updatedClass;
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

// Remove teacher from class by class ID
const removeTeacherFromClassByClassId = async (classId) => {
  // Validate class exists and get current homeroom teacher
  const classDoc = await ClassModel.findById(classId);
  if (!classDoc) throw new Error('Class not found');
  
  if (!classDoc.homeroomTeacher) {
    throw new Error('Class does not have a homeroom teacher');
  }
  
  const teacherId = classDoc.homeroomTeacher;
  
  // Remove teacher from class and get updated class
  const updatedClass = await ClassModel.findByIdAndUpdate(
    classId,
    { $unset: { homeroomTeacher: 1 } },
    { new: true, runValidators: true }
  )
    .populate('homeroomTeacher', 'firstName lastName email role')
    .populate('students', 'firstName lastName email role');
  
  // Remove teaching class from teacher
  await User.findByIdAndUpdate(
    teacherId,
    { $unset: { teachingClass: 1 } },
    { new: true, runValidators: true }
  );
  
  return updatedClass;
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

// Get students without assigned classes
const getUnassignedStudents = async () => {
  const students = await User.find({
    role: 'student',
    $or: [
      { currentClass: { $exists: false } },
      { currentClass: null }
    ]
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
  
  return students;
};

// Get students of a class
const getClassStudents = async (classId) => {
  // Validate class exists
  const cls = await ClassModel.findById(classId);
  if (!cls) throw new Error('Class not found');
  
  // Get all enrolled students for this class
  const enrollments = await StudentClass.find({
    class: classId,
    status: 'enrolled'
  })
    .populate({
      path: 'student',
      select: 'firstName lastName email phoneNumber dateOfBirth address',
      populate: {
        path: 'currentClass',
        select: 'name code'
      }
    })
    .sort({ enrolledAt: -1 });
  
  return {
    class: {
      _id: cls._id,
      name: cls.name,
      code: cls.code,
      description: cls.description,
      maxStudents: cls.maxStudents,
      isActive: cls.isActive
    },
    students: enrollments.map(enrollment => ({
      _id: enrollment.student._id,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      email: enrollment.student.email,
      phoneNumber: enrollment.student.phoneNumber,
      dateOfBirth: enrollment.student.dateOfBirth,
      address: enrollment.student.address,
      currentClass: enrollment.student.currentClass,
      enrollmentInfo: {
        _id: enrollment._id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        notes: enrollment.notes
      }
    }))
  };
};

module.exports = {
  createClass,
  listClasses,
  getClassById,
  updateClass,
  deleteClass,
  addStudent,
  removeStudent,
  // Homeroom teacher management
  setTeacherClass,
  removeTeacherFromClass,
  removeTeacherFromClassByClassId,
  getUnassignedTeachers,
  getClassesWithoutTeacher,
  // Student management
  getClassStudents,
  getUnassignedStudents
};

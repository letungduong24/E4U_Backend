const User = require('../models/user.model');
const Class = require('../models/class.model');
const mongoose = require('mongoose');

// User management
const listUsers = async ({ role, classId, q }) => {
  const query = {};
  if (role) query.role = role;
  
  // Handle search by name
  if (q) {
    query.$or = [
      { firstName: new RegExp(q, 'i') },
      { lastName: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') }
    ];
  }
  
  // Handle classId filter - filter users by class (either as current class or teaching class)
  if (classId) {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      throw new Error('Invalid classId format');
    }
    
    // Convert string to ObjectId
    const objectIdClassId = new mongoose.Types.ObjectId(classId);
    
    // If we already have $or from search, we need to combine with classId filter
    if (query.$or) {
      // User has both search and classId filter
      query.$and = [
        { $or: query.$or }, // Search conditions
        { $or: [
          { currentClass: objectIdClassId },
          { teachingClass: objectIdClassId }
        ]} // ClassId conditions
      ];
      delete query.$or; // Remove the original $or
    } else {
      // Only classId filter
      query.$or = [
        { currentClass: objectIdClassId },
        { teachingClass: objectIdClassId }
      ];
    }
  }

  const users = await User.find(query)
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

  return users;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId)
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
  if (!user) throw new Error('User not found');
  return user;
};

const updateUserByAdmin = async (userId, updateData) => {
  const allowedFields = ['firstName', 'lastName', 'role', 'isActive', 'email'];
  const payload = {};
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) payload[key] = updateData[key];
  }

  const user = await User.findByIdAndUpdate(
    userId,
    payload,
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

  if (!user) throw new Error('User not found');
  return user;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error('User not found');
  return { message: 'User deleted' };
};

const setUserActiveStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
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
  if (!user) throw new Error('User not found');
  return user;
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
  const classDoc = await Class.findById(classId);
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
  await Class.findByIdAndUpdate(classId, {
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
  await Class.findByIdAndUpdate(teacher.teachingClass, {
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
  const classes = await Class.find({
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
  // user
  listUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  setUserActiveStatus,
  // teacher class management
  setTeacherClass,
  removeTeacherFromClass,
  getUnassignedTeachers,
  getClassesWithoutTeacher
};



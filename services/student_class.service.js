const StudentClass = require('../models/student_class.model');
const User = require('../models/user.model');
const Class = require('../models/class.model');

// Enroll student in class
const enrollStudent = async (enrollmentData) => {
  const { student, class: classId, notes = '' } = enrollmentData;
  
  // Check if student exists
  const studentDoc = await User.findById(student);
  if (!studentDoc) throw new Error('Không tìm thấy học sinh');
  if (studentDoc.role !== 'student') throw new Error('Người dùng không phải là học sinh');
  
  // Check if class exists
  const classDoc = await Class.findById(classId);
  if (!classDoc) throw new Error('Không tìm thấy lớp học');
  
  // Check if student is already enrolled in this class
  const existingEnrollment = await StudentClass.findOne({ student, class: classId });
  if (existingEnrollment) {
    if (existingEnrollment.status === 'enrolled') {
      throw new Error('Học sinh đã được ghi danh vào lớp này');
    }
    if (existingEnrollment.status === 'dropped') {
      // Re-enroll the student
      existingEnrollment.status = 'enrolled';
      existingEnrollment.enrolledAt = new Date();
      existingEnrollment.droppedAt = null;
      existingEnrollment.notes = notes;
      await existingEnrollment.save();
      return existingEnrollment;
    }
  }
  
  // Check if student already has an active enrollment (only 1 current class allowed)
  const currentEnrollment = await StudentClass.findOne({ 
    student, 
    status: 'enrolled' 
  });
  if (currentEnrollment) {
    throw new Error('Học sinh chỉ có thể ghi danh vào một lớp tại một thời điểm. Vui lòng hoàn thành hoặc rời lớp hiện tại trước.');
  }
  
  // Check class capacity
  const currentEnrollments = await StudentClass.countDocuments({ 
    class: classId, 
    status: 'enrolled' 
  });
  if (currentEnrollments >= classDoc.maxStudents) {
    throw new Error('Lớp học đã đạt sĩ số tối đa');
  }
  
  // Create new enrollment
  const enrollment = await StudentClass.create({
    student,
    class: classId,
    notes
  });
  
  // Update user current class
  await User.findByIdAndUpdate(student, {
    currentClass: classId
  });
  
  // Update class references
  await Class.findByIdAndUpdate(classId, {
    $addToSet: { 
      students: student
    }
  });
  
  return enrollment;
};

// Get class enrollments
const getClassEnrollments = async (classId) => {
  const enrollments = await StudentClass.find({ class: classId })
    .populate({
      path: 'student',
      select: 'firstName lastName email role'
    })
    .sort({ enrolledAt: -1 });

  return enrollments;
};

// Get enrollment by ID
const getEnrollmentById = async (enrollmentId) => {
  const enrollment = await StudentClass.findById(enrollmentId)
    .populate({
      path: 'student',
      select: 'firstName lastName email role'
    })
    .populate({
      path: 'class',
      select: 'name code description homeroomTeacher maxStudents isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName email'
      }
    });

  if (!enrollment) throw new Error('Không tìm thấy đăng ký');
  return enrollment;
};

// Update enrollment
const updateEnrollment = async (enrollmentId, updateData) => {
  const allowed = ['status', 'notes'];
  const payload = {};
  
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(updateData, key)) {
      payload[key] = updateData[key];
    }
  }
  
  // Set completion date if status is completed
  if (payload.status === 'completed') {
    payload.completedAt = new Date();
  }
  
  // Set drop date if status is dropped
  if (payload.status === 'dropped') {
    payload.droppedAt = new Date();
  }
  
  const enrollment = await StudentClass.findByIdAndUpdate(
    enrollmentId, 
    payload, 
    { new: true, runValidators: true }
  )
    .populate({
      path: 'student',
      select: 'firstName lastName email role'
    })
    .populate({
      path: 'class',
      select: 'name code description homeroomTeacher maxStudents isActive',
      populate: {
        path: 'homeroomTeacher',
        select: 'firstName lastName email'
      }
    });

  if (!enrollment) throw new Error('Không tìm thấy đăng ký');
  
  // If student is no longer enrolled, remove from current class
  if (enrollment.status !== 'enrolled') {
    await User.findByIdAndUpdate(enrollment.student._id, {
      $unset: { currentClass: 1 }
    });
    
    await Class.findByIdAndUpdate(enrollment.class._id, {
      $pull: { students: enrollment.student._id }
    });
  }
  
  return enrollment;
};

// Transfer student to new class (complete current, enroll in new)
const transferStudent = async (studentId, newClassId, notes = '') => {
  // Check if student exists
  const studentDoc = await User.findById(studentId);
  if (!studentDoc) throw new Error('Không tìm thấy học sinh');
  if (studentDoc.role !== 'student') throw new Error('Người dùng không phải là học sinh');
  
  // Check if new class exists
  const newClassDoc = await Class.findById(newClassId);
  if (!newClassDoc) throw new Error('Không tìm thấy lớp học mới');
  
  // Get current enrollment
  const currentEnrollment = await StudentClass.findOne({ 
    student: studentId, 
    status: 'enrolled' 
  });
  
  if (!currentEnrollment) {
    throw new Error('Học sinh hiện chưa được ghi danh vào lớp nào');
  }
  
  // Check if student is already enrolled in the new class
  const existingEnrollment = await StudentClass.findOne({ 
    student: studentId, 
    class: newClassId 
  });
  
  if (existingEnrollment && existingEnrollment.status === 'enrolled') {
    throw new Error('Student is already enrolled in this class');
  }
  
  // Check new class capacity
  const currentEnrollments = await StudentClass.countDocuments({ 
    class: newClassId, 
    status: 'enrolled' 
  });
  if (currentEnrollments >= newClassDoc.maxStudents) {
    throw new Error('Lớp học mới đã đạt sĩ số tối đa');
  }
  
  // Complete current enrollment
  currentEnrollment.status = 'completed';
  currentEnrollment.completedAt = new Date();
  currentEnrollment.notes = currentEnrollment.notes + ` | Transferred to ${newClassDoc.name}`;
  await currentEnrollment.save();
  
  // Create new enrollment
  const newEnrollment = await StudentClass.create({
    student: studentId,
    class: newClassId,
    status: 'enrolled',
    notes: `Transferred from previous class | ${notes}`
  });
  
  // Update user current class
  await User.findByIdAndUpdate(studentId, {
    currentClass: newClassId
  });
  
  // Update class references
  await Class.findByIdAndUpdate(currentEnrollment.class, {
    $pull: { students: studentId }
  });
  
  await Class.findByIdAndUpdate(newClassId, {
    $addToSet: { 
      students: studentId
    }
  });
  
  return {
    completedEnrollment: currentEnrollment,
    newEnrollment: newEnrollment
  };
};

module.exports = {
  enrollStudent,
  getClassEnrollments,
  getEnrollmentById,
  updateEnrollment,
  transferStudent
};
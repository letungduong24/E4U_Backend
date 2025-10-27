const Document = require('../models/document.model');
const Class = require('../models/class.model');
const User = require('../models/user.model');

// @desc    Create a new document
// @access  Teacher only
const createDocument = async (documentData) => {
  try {
    // Verify teacher is assigned to the class
    const classData = await Class.findById(documentData.classId);
    if (!classData) {
      throw new Error('Class not found');
    }

    if (classData.homeroomTeacher.toString() !== documentData.teacherId.toString()) {
      throw new Error('You are not authorized to upload documents for this class');
    }

    const document = await Document.create(documentData);
    
    // Populate the created document (giống homework)
    return await document.populate("classId", "name code");
  } catch (error) {
    throw error;
  }
};

// @desc    Get document by ID
// @access  Teacher, Student (if enrolled in the class)
const getDocumentById = async (documentId) => {
  try {
    const document = await Document.findById(documentId)
      .populate('classId', 'name code');

    if (!document) {
      throw new Error('Document not found');
    }

    if (!document.isActive) {
      throw new Error('Document has been deleted');
    }

    return document;
  } catch (error) {
    throw error;
  }
};

// @desc    Get documents by class ID
// @access  Teacher, Student (if enrolled in the class)
const getDocumentsByClassId = async (classId) => {
  try {
    const documents = await Document.findByClass(classId);
    return documents;
  } catch (error) {
    throw error;
  }
};

// @desc    Get documents by teacher ID
// @access  Teacher only
const getDocumentsByTeacherId = async (teacherId) => {
  try {
    const documents = await Document.findByTeacher(teacherId);
    return documents;
  } catch (error) {
    throw error;
  }
};

// @desc    List documents with filters
// @access  Teacher, Student
const listDocuments = async (filters = {}) => {
  try {
    const {
      classId,
      teacherId,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    // Build query
    const query = { isActive: true };

    if (classId) {
      query.classId = classId;
    }

    if (teacherId) {
      query.teacherId = teacherId;
    }

    // Search in title and description using regex
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case-insensitive
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const documents = await Document.find(query)
      .populate('classId', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Document.countDocuments(query);

    return {
      documents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDocuments: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    throw error;
  }
};

// @desc    Update document
// @access  Teacher (owner only)
const updateDocument = async (documentId, updateData, teacherId) => {
  try {
    const document = await Document.findById(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.teacherId.toString() !== teacherId.toString()) {
      throw new Error('You are not authorized to update this document');
    }

    // Update lastModified will be handled by pre-save middleware
    const updatedDocument = await Document.findByIdAndUpdate(
      documentId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('classId', 'name code');

    return updatedDocument;
  } catch (error) {
    throw error;
  }
};

// @desc    Delete document (soft delete)
// @access  Teacher (owner only)
const deleteDocument = async (documentId, teacherId) => {
  try {
    const document = await Document.findById(documentId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.teacherId.toString() !== teacherId.toString()) {
      throw new Error('You are not authorized to delete this document');
    }

    // Soft delete by setting isActive to false
    await Document.findByIdAndUpdate(documentId, { isActive: false });

    return { message: 'Document deleted successfully' };
  } catch (error) {
    throw error;
  }
};


// @desc    Search documents
// @access  Teacher, Student
const searchDocuments = async (searchTerm, classId = null) => {
  try {
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive
    
    const query = {
      isActive: true,
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    };

    if (classId) {
      query.classId = classId;
    }

    const documents = await Document.find(query)
      .populate('classId', 'name code')
      .sort({ createdAt: -1 })
      .limit(20);

    return documents;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  createDocument,
  getDocumentById,
  getDocumentsByClassId,
  getDocumentsByTeacherId,
  listDocuments,
  updateDocument,
  deleteDocument,
  searchDocuments
};

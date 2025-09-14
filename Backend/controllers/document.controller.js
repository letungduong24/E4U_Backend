const documentService = require('../services/document.service');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/documents';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common document file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only documents, images, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Create document
// @route   POST /api/documents
// @access  Teacher
const createDocument = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.role !== 'teacher') {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'Access denied. Only teachers can upload documents.' 
      });
    }

    const { title, description, file } = req.body;

    const documentData = {
      title,
      description,
      classId: user.teachingClass,
      teacherId: user._id,
      file: {
        fileName: file || 'document.txt',
        originalName: file || 'document.txt',
        filePath: file || './uploads/documents/default.txt',
        fileSize: 0,
        mimeType: 'text/plain'
      }
    };

    const document = await documentService.createDocument(documentData);

    res.status(201).json({
      status: 'success',
      message: 'Document created successfully',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Teacher, Student (if enrolled in the class)
const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);

    // Check if user has access to this document
    const user = req.user;
    if (user.role === 'student') {
      if (user.currentClass.toString() !== document.classId._id.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. You can only view documents from your class.'
        });
      }
    } else if (user.role === 'teacher') {
      if (user._id.toString() !== document.teacherId._id.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. You can only view your own documents.'
        });
      }
    } else {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Only teachers and students can view documents.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get documents by class ID
// @route   GET /api/documents/class/:classId
// @access  Teacher, Student (if enrolled in the class)
const getDocumentsByClassId = async (req, res, next) => {
  try {
    const user = req.user;
    const classId = req.params.classId;

    // Check access permissions
    if (user.role === 'student') {
      if (user.currentClass.toString() !== classId) {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. You can only view documents from your class.'
        });
      }
    } else if (user.role === 'teacher') {
      // Teachers can only view documents from classes they teach
      // This check would need to be implemented based on your class-teacher relationship
    } else {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Only teachers and students can view documents.'
      });
    }

    const documents = await documentService.getDocumentsByClassId(classId);

    res.status(200).json({
      status: 'success',
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List documents with filters
// @route   GET /api/documents
// @access  Teacher, Student
const listDocuments = async (req, res, next) => {
  try {
    const user = req.user;
    const filters = { ...req.query };

    // Add role-based filtering
    if (user.role === 'teacher') {
      filters.teacherId = user._id;
    } else if (user.role === 'student') {
      filters.classId = user.currentClass;
    } else {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Only teachers and students can view documents.'
      });
    }

    const result = await documentService.listDocuments(filters);

    res.status(200).json({
      status: 'success',
      data: result.documents,
      pagination: result.pagination,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Teacher (owner only)
const updateDocument = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.role !== 'teacher') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Only teachers can update documents.'
      });
    }

    const updateData = { ...req.body };

    // If file is provided in body, update file information
    if (req.body.file) {
      updateData.file = {
        fileName: req.body.file,
        originalName: req.body.file,
        filePath: req.body.file,
        fileSize: 0,
        mimeType: 'text/plain'
      };
    }

    const document = await documentService.updateDocument(
      req.params.id,
      updateData,
      user._id
    );

    res.status(200).json({
      status: 'success',
      message: 'Document updated successfully',
      data: { document }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Teacher (owner only)
const deleteDocument = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.role !== 'teacher') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Only teachers can delete documents.'
      });
    }

    // Get document info before deletion to clean up file
    const document = await documentService.getDocumentById(req.params.id);
    
    const result = await documentService.deleteDocument(req.params.id, user._id);

    // Delete the physical file
    if (document.file && fs.existsSync(document.file.filePath)) {
      fs.unlinkSync(document.file.filePath);
    }

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Search documents
// @route   GET /api/documents/search
// @access  Teacher, Student
const searchDocuments = async (req, res, next) => {
  try {
    const user = req.user;
    const { q: searchTerm, classId } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Search term is required'
      });
    }

    let searchClassId = classId;
    
    // Add role-based filtering
    if (user.role === 'student') {
      searchClassId = user.currentClass;
    } else if (user.role === 'teacher') {
      // Teachers can search in their own documents
      // You might want to add additional filtering here
    } else {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Only teachers and students can search documents.'
      });
    }

    const documents = await documentService.searchDocuments(searchTerm, searchClassId);

    res.status(200).json({
      status: 'success',
      data: { documents }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download document file
// @route   GET /api/documents/:id/download
// @access  Teacher, Student (if enrolled in the class)
const downloadDocument = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.params.id);
    const user = req.user;

    // Check access permissions
    if (user.role === 'student') {
      if (user.currentClass.toString() !== document.classId._id.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. You can only download documents from your class.'
        });
      }
    } else if (user.role === 'teacher') {
      if (user._id.toString() !== document.teacherId.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'Access denied. You can only download your own documents.'
        });
      }
    } else {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied. Only teachers and students can download documents.'
      });
    }

    // Return file information (giống homework - không download file thật)
    res.status(200).json({
      status: 'success',
      message: 'Document file information retrieved successfully',
      data: {
        document: {
          _id: document._id,
          title: document.title,
          description: document.description,
          file: {
            fileName: document.file.fileName,
            originalName: document.file.originalName,
            filePath: document.file.filePath,
            fileSize: document.file.fileSize,
            mimeType: document.file.mimeType
          },
          uploadDate: document.uploadDate,
          lastModified: document.lastModified
        }
      }
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createDocument,
  getDocumentById,
  getDocumentsByClassId,
  listDocuments,
  updateDocument,
  deleteDocument,
  searchDocuments,
  downloadDocument,
  upload // Export multer upload middleware
};

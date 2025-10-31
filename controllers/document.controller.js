const documentService = require('../services/document.service');

// @desc    Create document
// @route   POST /api/documents
// @access  Teacher
const createDocument = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user.role !== 'teacher') {
      return res.status(403).json({ 
        status: 'fail', 
        message: 'Truy cập bị từ chối. Chỉ giáo viên mới có thể tải tài liệu lên.' 
      });
    }

    const { title, description, link } = req.body;

    if (!link) {
      return res.status(400).json({
        status: 'fail',
        message: 'Link tài liệu là bắt buộc'
      });
    }

    const documentData = {
      title,
      description,
      classId: user.teachingClass,
      teacherId: user._id,
      file: {
        fileName: link,
        filePath: link
      }
    };

    const document = await documentService.createDocument(documentData);

    res.status(201).json({
      status: 'success',
      message: 'Tạo tài liệu thành công',
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
          message: 'Truy cập bị từ chối. Bạn chỉ có thể xem tài liệu của chính mình.'
        });
      }
    } else {
      return res.status(403).json({
        status: 'fail',
        message: 'Truy cập bị từ chối. Chỉ giáo viên và học sinh mới có thể xem tài liệu.'
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
        message: 'Truy cập bị từ chối. Chỉ giáo viên và học sinh mới có thể xem tài liệu.'
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
        message: 'Truy cập bị từ chối. Chỉ giáo viên và học sinh mới có thể xem tài liệu.'
      });
    }

    const documents = await documentService.listDocuments(filters);

    res.status(200).json({
      status: 'success',
      data: documents,
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
        message: 'Truy cập bị từ chối. Chỉ giáo viên mới có thể cập nhật tài liệu.'
      });
    }

    const updateData = { ...req.body };

    // If link is provided in body, update file information
    if (req.body.link) {
      updateData.file = {
        fileName: req.body.link,
        filePath: req.body.link
      };
    }

    const document = await documentService.updateDocument(
      req.params.id,
      updateData,
      user._id
    );

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật tài liệu thành công',
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
        message: 'Truy cập bị từ chối. Chỉ giáo viên mới có thể xóa tài liệu.'
      });
    }

    const result = await documentService.deleteDocument(req.params.id, user._id);

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
        message: 'Thuật ngữ tìm kiếm là bắt buộc'
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
        message: 'Truy cập bị từ chối. Chỉ giáo viên và học sinh mới có thể tìm kiếm tài liệu.'
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



module.exports = {
  createDocument,
  getDocumentById,
  getDocumentsByClassId,
  listDocuments,
  updateDocument,
  deleteDocument,
  searchDocuments
};

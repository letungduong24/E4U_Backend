# Document Management API

This document describes the Document Management API endpoints for the Class Management System.

## Overview

The Document Management feature allows teachers to upload, manage, and share documents with their students. Students can view and download documents from their assigned classes.

## Features

### For Teachers
- Upload documents with file attachments
- Update document information
- Delete documents
- View document statistics
- Manage documents for their assigned classes

### For Students
- View documents from their class
- Download document files
- Search documents
- View recent documents

## API Endpoints

### Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Create Document
**POST** `/api/documents`

**Access:** Teacher only

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `title` (string, required): Document title (1-200 characters)
  - `description` (string, required): Document description (1-2000 characters)
  - `classId` (string, required): MongoDB ObjectId of the class
  - `file` (file, required): Document file to upload

**Response:**
```json
{
  "status": "success",
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "_id": "document_id",
      "title": "Document Title",
      "description": "Document description",
      "classId": {
        "_id": "class_id",
        "name": "Class Name",
        "code": "CLASS_CODE"
      },
      "teacherId": {
        "_id": "teacher_id",
        "firstName": "Teacher",
        "lastName": "Name"
      },
      "file": {
        "fileName": "generated_filename.pdf",
        "originalName": "original_filename.pdf",
        "filePath": "uploads/documents/file_path",
        "fileSize": 1024000,
        "mimeType": "application/pdf"
      },
      "uploadDate": "2024-01-15T10:00:00.000Z",
      "lastModified": "2024-01-15T10:00:00.000Z",
      "isActive": true
    }
  }
}
```

### 2. Get Document by ID
**GET** `/api/documents/:id`

**Access:** Teacher (owner), Student (if enrolled in the class)

**Response:**
```json
{
  "status": "success",
  "data": {
    "document": {
      "_id": "document_id",
      "title": "Document Title",
      "description": "Document description",
      "classId": {
        "_id": "class_id",
        "name": "Class Name",
        "code": "CLASS_CODE"
      },
      "teacherId": {
        "_id": "teacher_id",
        "firstName": "Teacher",
        "lastName": "Name"
      },
      "file": {
        "fileName": "generated_filename.pdf",
        "originalName": "original_filename.pdf",
        "filePath": "uploads/documents/file_path",
        "fileSize": 1024000,
        "mimeType": "application/pdf"
      },
      "uploadDate": "2024-01-15T10:00:00.000Z",
      "lastModified": "2024-01-15T10:00:00.000Z",
      "isActive": true
    }
  }
}
```

### 3. List Documents
**GET** `/api/documents`

**Access:** Teacher, Student

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Documents per page (default: 10)
- `sortBy` (string, optional): Sort field (default: 'uploadDate')
- `sortOrder` (string, optional): Sort order - 'asc' or 'desc' (default: 'desc')
- `search` (string, optional): Search term

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "document_id",
      "title": "Document Title",
      "description": "Document description",
      "classId": {
        "_id": "class_id",
        "name": "Class Name",
        "code": "CLASS_CODE"
      },
      "teacherId": {
        "_id": "teacher_id",
        "firstName": "Teacher",
        "lastName": "Name"
      },
      "file": {
        "fileName": "generated_filename.pdf",
        "originalName": "original_filename.pdf",
        "filePath": "uploads/documents/file_path",
        "fileSize": 1024000,
        "mimeType": "application/pdf"
      },
      "uploadDate": "2024-01-15T10:00:00.000Z",
      "lastModified": "2024-01-15T10:00:00.000Z",
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalDocuments": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "role": "teacher"
}
```

### 4. Get Documents by Class
**GET** `/api/documents/class/:classId`

**Access:** Teacher, Student (if enrolled in the class)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "_id": "document_id",
        "title": "Document Title",
        "description": "Document description",
        "classId": {
          "_id": "class_id",
          "name": "Class Name",
          "code": "CLASS_CODE"
        },
        "teacherId": {
          "_id": "teacher_id",
          "firstName": "Teacher",
          "lastName": "Name"
        },
        "file": {
          "fileName": "generated_filename.pdf",
          "originalName": "original_filename.pdf",
          "filePath": "uploads/documents/file_path",
          "fileSize": 1024000,
          "mimeType": "application/pdf"
        },
        "uploadDate": "2024-01-15T10:00:00.000Z",
        "lastModified": "2024-01-15T10:00:00.000Z",
        "isActive": true
      }
    ]
  }
}
```

### 5. Update Document
**PUT** `/api/documents/:id`

**Access:** Teacher (owner only)

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `title` (string, optional): New document title
  - `description` (string, optional): New document description
  - `file` (file, optional): New document file

**Response:**
```json
{
  "status": "success",
  "message": "Document updated successfully",
  "data": {
    "document": {
      "_id": "document_id",
      "title": "Updated Title",
      "description": "Updated description",
      "classId": {
        "_id": "class_id",
        "name": "Class Name",
        "code": "CLASS_CODE"
      },
      "teacherId": {
        "_id": "teacher_id",
        "firstName": "Teacher",
        "lastName": "Name"
      },
      "file": {
        "fileName": "new_generated_filename.pdf",
        "originalName": "new_original_filename.pdf",
        "filePath": "uploads/documents/new_file_path",
        "fileSize": 2048000,
        "mimeType": "application/pdf"
      },
      "uploadDate": "2024-01-15T10:00:00.000Z",
      "lastModified": "2024-01-15T12:00:00.000Z",
      "isActive": true
    }
  }
}
```

### 6. Delete Document
**DELETE** `/api/documents/:id`

**Access:** Teacher (owner only)

**Response:**
```json
{
  "status": "success",
  "message": "Document deleted successfully"
}
```

### 7. Download Document
**GET** `/api/documents/:id/download`

**Access:** Teacher (owner), Student (if enrolled in the class)

**Response:**
- Content-Type: Based on file MIME type
- Content-Disposition: `attachment; filename="original_filename.pdf"`
- Body: File stream

### 8. Search Documents
**GET** `/api/documents/search`

**Access:** Teacher, Student

**Query Parameters:**
- `q` (string, required): Search term
- `classId` (string, optional): Class ID to search within

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "_id": "document_id",
        "title": "Document Title",
        "description": "Document description",
        "classId": {
          "_id": "class_id",
          "name": "Class Name",
          "code": "CLASS_CODE"
        },
        "teacherId": {
          "_id": "teacher_id",
          "firstName": "Teacher",
          "lastName": "Name"
        },
        "file": {
          "fileName": "generated_filename.pdf",
          "originalName": "original_filename.pdf",
          "filePath": "uploads/documents/file_path",
          "fileSize": 1024000,
          "mimeType": "application/pdf"
        },
        "uploadDate": "2024-01-15T10:00:00.000Z",
        "lastModified": "2024-01-15T10:00:00.000Z",
        "isActive": true
      }
    ]
  }
}
```

### 9. Get Recent Documents
**GET** `/api/documents/recent/:classId`

**Access:** Teacher, Student (if enrolled in the class)

**Query Parameters:**
- `limit` (number, optional): Number of recent documents (default: 5)

**Response:**
```json
{
  "status": "success",
  "data": {
    "documents": [
      {
        "_id": "document_id",
        "title": "Recent Document",
        "description": "Document description",
        "classId": {
          "_id": "class_id",
          "name": "Class Name",
          "code": "CLASS_CODE"
        },
        "teacherId": {
          "_id": "teacher_id",
          "firstName": "Teacher",
          "lastName": "Name"
        },
        "file": {
          "fileName": "generated_filename.pdf",
          "originalName": "original_filename.pdf",
          "filePath": "uploads/documents/file_path",
          "fileSize": 1024000,
          "mimeType": "application/pdf"
        },
        "uploadDate": "2024-01-15T10:00:00.000Z",
        "lastModified": "2024-01-15T10:00:00.000Z",
        "isActive": true
      }
    ]
  }
}
```

### 10. Get Document Statistics
**GET** `/api/documents/stats`

**Access:** Teacher only

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalDocuments": 25,
    "documentsByClass": [
      {
        "className": "Class A",
        "classCode": "CLASSA",
        "documentCount": 10,
        "latestUpload": "2024-01-15T10:00:00.000Z"
      },
      {
        "className": "Class B",
        "classCode": "CLASSB",
        "documentCount": 15,
        "latestUpload": "2024-01-14T15:30:00.000Z"
      }
    ]
  }
}
```

## File Upload Support

### Supported File Types
- PDF documents
- Microsoft Word documents (.doc, .docx)
- Microsoft Excel spreadsheets (.xls, .xlsx)
- Microsoft PowerPoint presentations (.ppt, .pptx)
- Text files (.txt)
- CSV files
- Images (JPEG, PNG, GIF)

### File Size Limit
- Maximum file size: 10MB

### File Storage
- Files are stored in the `uploads/documents/` directory
- Filenames are generated with timestamps to prevent conflicts
- Original filenames are preserved in the database

## Error Responses

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Access denied. Please log in."
}
```

### 403 Forbidden
```json
{
  "status": "fail",
  "message": "Access denied. You are not authorized to perform this action."
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Document not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## Business Rules

1. **Teacher Authorization**: Only teachers can upload, update, or delete documents
2. **Class Assignment**: Teachers can only manage documents for classes they are assigned to
3. **Student Access**: Students can only view and download documents from their assigned class
4. **File Management**: When updating or deleting documents, associated files are also managed
5. **Soft Delete**: Documents are soft-deleted (isActive: false) rather than permanently removed
6. **Automatic Timestamps**: uploadDate and lastModified are automatically managed

## Usage Examples

### Upload a Document (Teacher)
```bash
curl -X POST http://localhost:5000/api/documents \
  -H "Authorization: Bearer <teacher_token>" \
  -F "title=Math Assignment 1" \
  -F "description=Please read this document before doing the homework" \
  -F "classId=64a1b2c3d4e5f6789012345" \
  -F "file=@/path/to/document.pdf"
```

### Get Documents for a Class (Student)
```bash
curl -X GET http://localhost:5000/api/documents/class/64a1b2c3d4e5f6789012345 \
  -H "Authorization: Bearer <student_token>"
```

### Download a Document
```bash
curl -X GET http://localhost:5000/api/documents/64a1b2c3d4e5f6789012346/download \
  -H "Authorization: Bearer <user_token>" \
  -o downloaded_document.pdf
```

### Search Documents
```bash
curl -X GET "http://localhost:5000/api/documents/search?q=math&classId=64a1b2c3d4e5f6789012345" \
  -H "Authorization: Bearer <user_token>"
```

This API provides a complete solution for document management in the class management system, with proper validation, authorization, and file handling.

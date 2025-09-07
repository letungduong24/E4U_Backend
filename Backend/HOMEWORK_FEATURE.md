# Homework Assignment Feature

This document describes the homework assignment feature implemented for the Class Management System.

## Overview

The homework feature allows teachers to create, manage, and grade homework assignments for their classes, while students can view, submit, and track their homework submissions.

## Features

### For Teachers
- Create homework assignments with detailed descriptions and instructions
- Set due dates, points, and grading criteria
- Publish assignments to make them visible to students
- Grade student submissions with feedback
- View analytics and submission statistics
- Manage late submission policies
- Support for file attachments
- Multiple homework types (assignment, quiz, project, essay, presentation, lab)

### For Students
- View published homework assignments
- Submit homework with text content and file attachments
- Track submission status and grades
- View upcoming and overdue assignments
- Resubmit assignments (if allowed by teacher)
- View feedback and grades from teachers

## API Endpoints

### Teacher Endpoints

#### Create Homework
```
POST /api/homeworks
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Math Assignment 1",
  "description": "Solve the following problems...",
  "instructions": "Show all your work",
  "class": "class_id",
  "dueDate": "2024-01-15T23:59:59.000Z",
  "allowLateSubmission": false,
  "maxAttempts": 1,
  "attachments": []
}
```

#### List Teacher's Homeworks
```
GET /api/homeworks/teacher?page=1&limit=10&status=published&type=assignment
Authorization: Bearer <teacher_token>
```

#### Update Homework
```
PUT /api/homeworks/:id
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description..."
}
```

#### Publish Homework
```
PATCH /api/homeworks/:id/publish
Authorization: Bearer <teacher_token>
```

#### Close Homework
```
PATCH /api/homeworks/:id/close
Authorization: Bearer <teacher_token>
```

#### Get Homework Submissions
```
GET /api/homeworks/:id/submissions
Authorization: Bearer <teacher_token>
```

#### Grade Submission
```
PATCH /api/homeworks/submissions/:submissionId/grade
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "score": 85,
  "feedback": "Good work! Consider showing more steps.",
  "grade": "B"
}
```

#### Get Homework Analytics
```
GET /api/homeworks/:id/analytics
Authorization: Bearer <teacher_token>
```

### Student Endpoints

#### List Homeworks
```
GET /api/homeworks?page=1&limit=10&status=published
Authorization: Bearer <student_token>
```

#### Get Upcoming Assignments
```
GET /api/homeworks/upcoming?days=7
Authorization: Bearer <student_token>
```

#### Get Overdue Assignments
```
GET /api/homeworks/overdue
Authorization: Bearer <student_token>
```

#### Submit Homework
```
POST /api/homeworks/:id/submit
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "content": "My solution to the problem...",
  "attachments": [
    {
      "filename": "solution.pdf",
      "originalName": "my_solution.pdf",
      "filePath": "/uploads/solution.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf"
    }
  ],
  "notes": "Additional notes for the teacher"
}
```

#### Get Student Submissions
```
GET /api/homeworks/submissions/student?classId=class_id
Authorization: Bearer <student_token>
```

## Data Models

### Homework Model
```javascript
{
  title: String (required, max 200 chars),
  description: String (required, max 2000 chars),
  instructions: String (optional, max 1000 chars),
  class: ObjectId (required, ref: 'Class'),
  teacher: ObjectId (required, ref: 'User'),
  dueDate: Date (required),
  assignedDate: Date (default: now),
  points: Number (required, 1-1000),
  type: String (enum: assignment, quiz, project, essay, presentation, lab),
  status: String (enum: draft, published, closed),
  attachments: [AttachmentSchema],
  allowLateSubmission: Boolean (default: false),
  latePenalty: Number (0-100, default: 0),
  maxAttempts: Number (1-10, default: 1),
  gradingType: String (enum: points, percentage, letter),
  rubric: String (optional, max 2000 chars),
  tags: [String],
  isVisible: Boolean (default: true),
  totalSubmissions: Number (computed),
  averageScore: Number (computed)
}
```

### Homework Submission Model
```javascript
{
  homework: ObjectId (required, ref: 'Homework'),
  student: ObjectId (required, ref: 'User'),
  class: ObjectId (required, ref: 'Class'),
  content: String (optional, max 5000 chars),
  attachments: [AttachmentSchema],
  status: String (enum: draft, submitted, graded, returned),
  submittedAt: Date,
  isLate: Boolean (computed),
  score: Number (0-1000),
  maxScore: Number (required),
  percentage: Number (computed),
  grade: String (optional),
  feedback: String (optional, max 2000 chars),
  gradedAt: Date,
  gradedBy: ObjectId (ref: 'User'),
  attemptNumber: Number (default: 1),
  latePenalty: Number (0-100),
  finalScore: Number (computed),
  timeSpent: Number (minutes),
  notes: String (optional, max 500 chars)
}
```

## Business Rules

1. **Teacher Authorization**: Only the teacher who created a homework can modify, publish, close, or grade it.

2. **Student Enrollment**: Students can only submit homework for classes they are enrolled in.

3. **Due Date Validation**: Due dates must be in the future when creating or updating homework.

4. **Late Submission**: Late submissions are only allowed if `allowLateSubmission` is true.

5. **Resubmission Limits**: Students can only resubmit up to `maxAttempts` times.

6. **Status Flow**: Homework status flows: draft → published → closed

7. **Submission Status**: Submission status flows: draft → submitted → graded → returned

8. **Grading**: Only teachers can grade submissions, and scores cannot exceed the maximum points.

## File Upload Support

The system supports file attachments for both homework assignments and submissions. File metadata is stored in the database with the following structure:

```javascript
{
  filename: String,        // Generated filename
  originalName: String,    // Original filename
  filePath: String,        // Server file path
  fileSize: Number,        // File size in bytes
  mimeType: String,        // MIME type
  uploadedAt: Date         // Upload timestamp
}
```

## Analytics

The system provides analytics for teachers including:
- Total students in class
- Submission rate
- Number of graded submissions
- Number of late submissions
- Average score
- Score distribution (A, B, C, D, F grades)

## Error Handling

The system includes comprehensive error handling for:
- Validation errors
- Authorization errors
- Business rule violations
- Database errors
- File upload errors

## Security

- All endpoints require authentication
- Role-based authorization (teacher/student)
- Input validation and sanitization
- File upload security
- SQL injection prevention through Mongoose

## Usage Examples

### Creating a Math Assignment
```javascript
const homework = await homeworkService.createHomework({
  title: "Algebra Practice Problems",
  description: "Complete exercises 1-20 from chapter 3",
  instructions: "Show all work and circle your final answers",
  class: "64a1b2c3d4e5f6789012345",
  teacher: "64a1b2c3d4e5f6789012346",
  dueDate: "2024-01-20T23:59:59.000Z",
  allowLateSubmission: false,
  maxAttempts: 1,
  attachments: []
});
```

### Submitting Homework
```javascript
const submission = await homeworkService.submitHomework({
  homeworkId: "64a1b2c3d4e5f6789012347",
  studentId: "64a1b2c3d4e5f6789012348",
  content: "Problem 1: x = 5\nProblem 2: y = 10\n...",
  attachments: [{
    filename: "work.pdf",
    originalName: "my_work.pdf",
    filePath: "/uploads/work.pdf",
    fileSize: 2048000,
    mimeType: "application/pdf"
  }],
  notes: "I had trouble with problem 15"
});
```

### Grading a Submission
```javascript
const gradedSubmission = await homeworkService.gradeSubmission(
  "64a1b2c3d4e5f6789012349",
  {
    score: 45,
    feedback: "Good work on problems 1-15. For problems 16-20, remember to check your work.",
    grade: "A-"
  },
  "64a1b2c3d4e5f6789012346"
);
```

This homework feature provides a complete solution for managing assignments in the class management system, with proper validation, authorization, and user experience considerations.

# VirtuLearn - Learning Management System

## Overview
VirtuLearn is a comprehensive Learning Management System (LMS) built with React and Django. It provides a platform for course management, student enrollment, and progress tracking with separate interfaces for students and instructors.

## Features

### User Authentication & Authorization
- Secure registration and login system
- Email verification for new accounts
- Role-based access control (Student/Instructor)
- Password change functionality
- Authentication using simple JWT tokens

### Student Features
- Browse available courses with filtering options
- Enroll in courses
- Track learning progress
- Access course materials and resources
- Download and preview course resources
- View lesson completion status

### Instructor Features
- Course management (create, edit, delete)
- Lesson management within courses
- Resource upload and management
- Visibility control for courses
- View mode switching between instructor and student views

## Technical Stack

### Frontend
- React
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for API communication

### Backend
- Django
- Django REST Framework
- MySQL database

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - User login
- `POST /api/auth/verify-email/` - Verify email address
- `POST /api/auth/resend-verification/` - Resend verification email
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/logout/` - User logout

### Course Endpoints
- `GET /api/courses/available/` - List available courses
- `GET /api/courses/enrolled/` - List enrolled courses
- `POST /api/courses/enroll/{course_id}/` - Enroll in a course
- `GET /api/courses/{course_id}/progress/` - Get course progress
- `GET /api/courses/{course_id}/lessons/` - Get course lessons

### Instructor Endpoints
- `GET /api/admin/courses/` - List instructor courses
- `POST /api/admin/courses/add/` - Add new course
- `DELETE /api/admin/courses/remove/{course_id}/` - Remove course
- `PATCH /api/admin/courses/{course_id}/visibility/` - Update course visibility
- `POST /api/admin/lessons/add/` - Add new lesson
- `DELETE /api/admin/lessons/{lesson_id}/remove` - Remove lesson

## Security Features
- Password hashing using Django's authentication system
- JWT for authentication
- Input validation and sanitization
- File upload restrictions and validation

## Project Structure
```
project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   └── public/
└── backend/
    ├── content/
    │   ├── models/
    │   ├── views/
    │   ├── serializers/
    │   └── permissions/
    └── backend/
```

# Learning Management System (LMS) Admin and User Dashboard for EcoFix Solutions

A comprehensive Learning Management System (LMS) built with Django (backend) and React (frontend). The platform includes an **Admin Dashboard** for managing courses, lessons, users, and events, as well as a **User Dashboard** for students to track progress, access course content, and participate in events.

## Features

### Admin Dashboard
- **User Management**: View registered users.
- **Course Management**: Add, edit, and delete courses.
- **Lesson Management**: Manage lessons for courses, including adding, reordering, and deleting lessons.
- **Event Management**: Create, edit, delete, and view registrations for events.
- **Lesson Progress Tracking**: Monitor user progress for lessons and courses.
- **Role-Based Access Control**: Separate admin and user functionalities.

### User Dashboard
- **Course Access**: View all available courses and their lessons.
- **Lesson Progress**: Mark lessons as complete and track course progress.
- **Event Participation**: View and register for events.
- **Profile Management**: Manage user details and preferences.

### Frontend
- Built using **React** and styled with **Material-UI** for a modern, responsive design.
- Features dialog-based interfaces for enhanced user experience.

### Backend
- Powered by **Django REST Framework** with REST APIs for all operations.
- **Role-Based Access Control** to differentiate between admin and user roles.
- Database integration with MySQL.

---

## Usage

### Admin Dashboard
- Accessible only to admins.
- Includes panels to manage:
  - **Users**: View user information such as name, email, and role.
  - **Courses**: Add, edit, and delete courses.
  - **Lessons**: Manage lessons for specific courses with ordering functionality.
  - **Events**: Create and manage events, and view event registrations.

### User Dashboard
- Accessible to registered users.
- Features include:
  - **Browse Courses**: Access all courses, view lesson details, and track progress.
  - **Track Progress**: Mark lessons as complete and monitor course progress percentage.
  - **Participate in Events**: View available events, register, and track event participation.
  - **Profile Management**: Update profile information and preferences.

---

## API Endpoints

### Authentication
- `POST /auth/login/`: User login
- `POST /auth/register/`: User registration

### Admin APIs
- **Courses**
  - `GET /api/admin/courses/`: List all courses
  - `POST /api/admin/courses/add/`: Add a new course
  - `DELETE /api/admin/courses/remove/<course_id>/`: Delete a course
- **Lessons**
  - `GET /api/courses/<course_id>/lessons/`: Get lessons for a specific course
  - `POST /api/admin/lessons/add/`: Add a lesson to a course
  - `DELETE /api/admin/lessons/remove/<lesson_id>/`: Delete a lesson
- **Events**
  - `GET /api/admin/events/`: List all events
  - `POST /api/admin/events/add/`: Add an event
  - `DELETE /api/admin/events/remove/<event_id>/`: Delete an event
  - `GET /api/admin/events/<event_id>/registrations/`: View registrations for an event

### User APIs
- **Courses**
  - `GET /api/courses/`: List all courses
  - `GET /api/course/<course_id>/progress/`: Get user progress for a course
- **Lessons**
  - `POST /api/lesson/<lesson_id>/progress/`: Update progress for a lesson
- **Events**
  - `GET /api/events/`: List all events
  - `POST /api/event/<event_id>/register/`: Register for an event
  - `DELETE /api/event/<event_id>/unregister/`: Unregister from an event

---

## Technologies Used

### Backend
- **Django**: Web framework for the backend.
- **Django REST Framework**: For building REST APIs.
- **MySQL**: Database support.
- **Django ORM**: For database interactions.

### Frontend
- **React**: JavaScript library for building user interfaces.
- **Material-UI**: Component library for responsive UI design.
- **Axios**: For API integration and HTTP requests.
- **Node**: Node Package Manager (NPM) for required dependencies 

---

## Screenshots

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

### Lesson Management
![Lesson Management](screenshots/lesson-management.png)

### Event Management
![Event Management](screenshots/event-management.png)

### User Dashboard
![User Dashboard](screenshots/user-dashboard.png)

### Course Progress
![Course Progress](screenshots/course-progress.png)

---

## Acknowledgments

- **Material-UI**: For UI components.
- **Django REST Framework**: For API development.
- Inspiration from popular e-learning platforms like Udemy and Coursera.

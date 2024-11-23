import axios from "axios";

// Create an Axios instance with baseURL
const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

// Add a request interceptor to include the Authorization token
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

// User Authentication APIs
export const loginUser = async (email, password) => {
    const response = await API.post("auth/login/", { email, password });
    // Store the token and role in localStorage
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("userRole", response.data.role); // Save role
    return response.data; // Returns { token: string, role: string }
};

export const registerUser = async (name, email, password) => {
    const response = await API.post("auth/register/", { name, email, password });
    // Store the token and assume the userRole as 'user'
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("userRole", "user");
    return response.data; // Returns { message: string, token: string }
};

// Logout function
export const logoutUser = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
};

// Events APIs
export const getEvents = async () => {
    const response = await API.get("events/");
    return response.data;
};

// Admin Events APIs
export const getAdminEvents = async () => {
    const response = await API.get("admin/events/");
    return response.data;
};

export const addAdminEvent = async (eventData) => {
    const response = await API.post("admin/events/add/", eventData);
    return response.data;
};

export const removeAdminEvent = async (eventId) => {
    const response = await API.delete(`admin/events/remove/${eventId}/`);
    return response.data;
};

// Courses APIs
export const getCourses = async () => {
    const response = await API.get("courses/");
    return response.data;
};

// Admin Courses APIs
export const getAdminCourses = async () => {
    const response = await API.get("admin/courses/");
    return response.data;
};

export const addAdminCourse = async (courseData) => {
    const response = await API.post("admin/courses/add/", courseData);
    return response.data;
};

export const removeAdminCourse = async (courseId) => {
    const response = await API.delete(`admin/courses/remove/${courseId}/`);
    return response.data;
};

// Users APIs
export const getAdminUsers = async () => {
    const response = await API.get("admin/users/");
    return response.data;
};

export const registerUserEvent = async (eventId) => {
    const response = await API.post(`event/${eventId}/register/`);
    return response.data;
};

export const getUserRegisteredEvents = async () => {
    const response = await API.get(`event/list/`);
    return response.data;
};

export const unregisterUserEvent = async (eventId) => {
    const response = await API.delete(`event/${eventId}/unregister/`);
    return response.data;
};

export const getEventRegistrations = async (eventId) => {
    const response = await API.get(`admin/events/${eventId}/registrations/`);
    return response.data; 
};

// User Progress APIs
export const updateLessonProgress = async (lessonId, progressData) => {
    const response = await API.post(`lesson/${lessonId}/progress/`, progressData);
    return response.data;
};

export const getCourseProgress = async (courseId) => {
    const response = await API.get(`course/${courseId}/progress/`);
    return response.data;
};

export const getLessonsForCourse = async (courseId) => {
    const response = await API.get(`courses/${courseId}/lessons/`);
    return response.data;
};

export default API;

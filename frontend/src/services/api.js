// frontend/src/services/api.js
import axios from "axios";


const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',  
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export const loginUser = async (email, password) => {
    try {
        const response = await API.post("auth/login/", { email, password });        
        if (response.data) {
            localStorage.setItem("userName", response.data.name);
            localStorage.setItem("userEmail", response.data.email);
            localStorage.setItem("userRole", response.data.role);
        }
        return response.data;
    } catch (error) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error('Login failed');
    }
};

export const registerUser = async (name, email, password) => {
    const response = await API.post("auth/register/", { name, email, password });
    return response.data;
};

export const verifyEmail = async (token) => {
    const response = await API.post("auth/verify-email/", { token });
    if (response.data.role) {
        localStorage.setItem("userRole", response.data.role);
    }
    return response.data;
};

export const resendVerificationEmail = async (email) => {
    const response = await API.post("auth/resend-verification/", { email });
    return response.data;
};

export const checkEmailVerification = async (email) => {
    const response = await API.get(`auth/verification-status/${email}/`);
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await API.post("auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword
    });
    return response.data;
};

export const logoutUser = async () => {
    try {
        await API.post("auth/logout/");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("pendingVerification");
        
        window.location.href = '/';
    } catch (error) {
        console.error("Logout failed:", error);
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("pendingVerification");
        window.location.href = '/';
    }
};

export const getEvents = async () => {
    const response = await API.get("events/");
    return response.data;
};

export const getAdminEvents = async () => {
    const response = await API.get("admin/events/");
    return response.data;
};

export const addAdminEvent = async (eventData) => {
    const response = await API.post("admin/events/add/", eventData);
    return response.data;
};

export const removeAdminEvent = async (eventId) => {
    const response = await API.delete(`admin/events/${eventId}/remove/`);
    return response.data;
};

export const getCourses = async () => {
    const response = await API.get("courses/");
    return response.data;
};

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

export const getAdminUsers = async () => {
    const response = await API.get("admin/users/");
    return response.data;
};

export const updateLessonProgress = async (lessonId, completed) => {
    const response = await API.post(`lessons/${lessonId}/progress/`, { completed });
    return response.data;
};

export const getCourseProgress = async (courseId) => {
    const response = await API.get(`courses/${courseId}/progress/`);
    return response.data;
};

export const getLessonsForCourse = async (courseId) => {
    const response = await API.get(`courses/${courseId}/lessons/`);
    return response.data;
};

export const getLessonResources = async (lessonId) => {
    const response = await API.get(`lessons/${lessonId}/resources/`);
    return response.data;
};

export const addAdminLesson = async (lessonData) => {
    const response = await API.post(`admin/lessons/add/`, lessonData);
    return response.data;
};

export const addLessonResource = async (lessonResourceData) => {
    const response = await API.post("admin/lessons/resources/add/", lessonResourceData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const removeAdminLesson = async (lessonId) => {
    const response = await API.delete(`admin/lessons/${lessonId}/remove`);
    return response.data;
};

export default API;

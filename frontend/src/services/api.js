import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const loginUser = async (email, password) => {
    const response = await API.post("auth/login/", { email, password });
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("userRole", response.data.role); 
    return response.data; 
};

export const registerUser = async (name, email, password) => {
    const response = await API.post("auth/register/", { name, email, password });
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("userRole", "user");
    return response.data; 
};

export const logoutUser = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
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

export const registerUserEvent = async (eventId) => {
    const response = await API.post(`events/${eventId}/register/`);
    return response.data;
};

export const getUserRegisteredEvents = async () => {
    const response = await API.get(`events/user/list/`);
    return response.data;
};

export const unregisterUserEvent = async (eventId) => {
    const response = await API.delete(`events/${eventId}/unregister/`);
    return response.data;
};

export const getEventRegistrations = async (eventId) => {
    const response = await API.get(`admin/events/${eventId}/registrations/`);
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

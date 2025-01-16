// frontend/src/services/api.js
import axios from "axios";
import { clearAuthData, setAuthData } from '../utils/auth';


const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL, 
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export const loginUser = async (email, password) => {
    try {
        clearAuthData();
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
    try {
        const response = await API.post("auth/verify-email/", { token });
        if (response.data) {
            clearAuthData(); 
            setAuthData(response.data);
        }
        return response.data;
    } catch (error) {
        clearAuthData();
        throw error;
    }
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
        clearAuthData(); 
        window.location.href = '/';
    } catch (error) {
        clearAuthData(); 
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

export const getAvailableCourses = async () => {
    const response = await API.get('courses/available/');
    return response.data;
};

export const enrollCourse = async (courseId) => {
    const response = await API.post(`courses/enroll/${courseId}/`);
    return response.data;
};

export const getEnrolledCourses = async () => {
    const response = await API.get('courses/enrolled/');
    return response.data;  
}
export const getAdminCourses = async () => {
    try {
      const response = await API.get("admin/courses/");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

export const addAdminCourse = async (courseData) => {
    const formattedData = {
        ...courseData,
        visibility_start_date: courseData.visibility_start_date 
            ? new Date(courseData.visibility_start_date).toISOString()
            : null,
        visibility_end_date: courseData.visibility_end_date
            ? new Date(courseData.visibility_end_date).toISOString()
            : null,
    };
    
    const response = await API.post("admin/courses/add/", formattedData);
    return response.data;
};


export const updateCourseVisibility = async (courseId, visibilityData) => {
    try {
        const response = await API.patch(
            `admin/courses/${courseId}/visibility/`, 
            visibilityData
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const removeAdminCourse = async (courseId) => {
    const response = await API.delete(`admin/courses/remove/${courseId}/`);
    return response.data;
};

export const updateAdminCourse = async (courseId, courseData) => {
    const formattedData = {
        ...courseData,
        visibility_start_date: courseData.visibility_start_date 
            ? new Date(courseData.visibility_start_date).toISOString()
            : null,
        visibility_end_date: courseData.visibility_end_date
            ? new Date(courseData.visibility_end_date).toISOString()
            : null,
    };
    
    try {
        const response = await API.patch(`admin/courses/${courseId}/update/`, formattedData);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.error || 'Failed to update course';
        throw new Error(errorMessage);
    }
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

export const getResourcePreview = async (resourceId) => {
    const response = await API.get(`resources/${resourceId}/preview/`, {
        responseType: 'blob'
    });
    return response.data;
};

export const downloadResource = async (resourceId, resourceTitle) => {
    try {
        const response = await API.get(`resources/${resourceId}/download/`, {
            responseType: 'blob'
        });
        
        let filename = resourceTitle;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameMatch = /filename="(.+)"/.exec(contentDisposition);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }
        
        const blob = new Blob([response.data], { 
            type: response.headers['content-type'] || 'application/octet-stream'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        throw error;
    }
};

export const getResourceMetadata = async (resourceId) => {
    const response = await API.get(`lessons/resources/${resourceId}/`);
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

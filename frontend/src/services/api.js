// frontend/src/services/api.js
import axios from "axios";
import { clearAuthData, setAuthData } from '../utils/auth';
import { jwtDecode } from 'jwt-decode';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL, 
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Add an interceptor to add the JWT token to every request
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const loginUser = async (email, password) => {
    try {

        const response = await API.post("auth/login/", { email, password });        

        const { access_token, refresh_token, role, name, email: responseEmail } = response.data;

        if (!access_token) {
            throw new Error('Login failed: No access token received');
        }

        // Decode token to verify roles and payload
        const decoded = jwtDecode(access_token);

        // Store access token
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // Store user info
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", responseEmail);
        localStorage.setItem("userRole", role);

        return {
            name,
            email: responseEmail,
            role
        };
    } catch (error) {        
        // More specific error handling
        if (error.response) {
            if (error.response.status === 403) {
                if (error.response.data.needsVerification) {
                    throw new Error('Please verify your email before logging in');
                }
            } else if (error.response.status === 404) {
                throw new Error('No account found with this email address');
            } else if (error.response.status === 400) {
                throw new Error(error.response.data.error || 'Incorrect email or password');
            }
        }
        
        // Generic error fallback
        throw new Error(
            error.response?.data?.error || 
            error.message || 
            'Login failed. Please try again.'
        );
    }
};

export const registerUser = async (name, email, password) => {
    const response = await API.post("auth/register/", { name, email, password });
    return response.data;
};

export const verifyEmail = async (token) => {
    try {
        const response = await API.post("auth/verify-email/", { token });
        return response.data;
    } catch (error) {
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
        const refreshToken = localStorage.getItem('refresh_token');
        
        await API.post("auth/logout/", { 
            refresh_token: refreshToken 
        });
    } catch (error) {
    } finally {
        // Clear all stored data
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('viewMode');
        
        window.location.href = '/';
    }
};

const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp < Date.now() / 1000;
    } catch (error) {
        return true;
    }
};

export const getUserRole = () => {
    const token = localStorage.getItem('access_token');
    
    if (!token || isTokenExpired(token)) {
        return null;
    }
    
    try {
        const decoded = jwtDecode(token);
        return decoded.role;
    } catch (error) {
        return null;
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

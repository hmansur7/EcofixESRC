import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

// Add token to the headers for every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const loginUser = async (email, password) => {
    const response = await API.post("auth/login/", { email, password });
    return response.data;
};

export const registerUser = async (name, email, password) => {
    const response = await API.post("auth/register/", { name, email, password });
    return response.data;
};

export const getEvents = async () => {
    const response = await API.get("events/");
    return response.data;
};

export const getCourses = async () => {
    const response = await API.get("courses/");
    return response.data;
};

export const logoutUser = () => {
    localStorage.removeItem("authToken");
};


export default API;

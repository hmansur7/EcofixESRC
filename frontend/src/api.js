import axios from 'axios';


const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 10000, 
});



export const fetchLearningResources = () => API.get('courses/');
export const fetchEvents = () => API.get('events/');
export const fetchUserProgress = () => API.get('progress/');

export const createLearningResource = (data) => API.post('courses/', data);
export const updateLearningResource = (id, data) => API.put(`courses/${id}/`, data);
export const deleteLearningResource = (id) => API.delete(`courses/${id}/`);

export default API;

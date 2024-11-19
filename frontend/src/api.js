import axios from 'axios';


const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    timeout: 10000, 
});



export const fetchLearningResources = () => API.get('contents/');
export const fetchEvents = () => API.get('events/');
export const fetchUserProgress = () => API.get('user-progress/');

export const createLearningResource = (data) => API.post('contents/', data);
export const updateLearningResource = (id, data) => API.put(`contents/${id}/`, data);
export const deleteLearningResource = (id) => API.delete(`contents/${id}/`);

export default API;

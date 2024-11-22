const BASE_URL = "http://127.0.0.1:8000/api/auth/";

// Utility function to handle API requests
const request = async (url, method = "GET", body = null, token = null) => {
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Token ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "An error occurred");
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Register a new user
export const registerUser = async (name, email, password) => {
    const url = `${BASE_URL}register/`;
    const body = { name, email, password };
    return await request(url, "POST", body);
};

// Log in a user
export const loginUser = async (email, password) => {
    const url = `${BASE_URL}login/`;
    const body = { email, password };
    return await request(url, "POST", body);
};

// Get list of events (requires authentication)
export const getEvents = async (token) => {
    const url = `${BASE_URL}events/`;
    return await request(url, "GET", null, token);
};

// Fetch learning resources
export const getResources = async (token = null) => {
    const url = "http://127.0.0.1:8000/api/courses/"; // Adjust endpoint as necessary
    return await request(url, "GET", null, token);
};

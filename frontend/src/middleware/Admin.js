import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const getUserRole = (token) => {
    try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded);
        return decoded.role; // Ensure this matches the exact key in your JWT payload
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp < Date.now() / 1000;
        console.log('Token expiration check:', {
            exp: decoded.exp,
            current: Date.now() / 1000,
            isExpired
        });
        return isExpired;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem("access_token");
    const userRole = localStorage.getItem("userRole");

    console.log('AdminRoute checks:', {
        token: !!token,
        storedRole: userRole,
        viewMode: localStorage.getItem("viewMode")
    });

    if (!token) {
        console.log('No token found, redirecting to login');
        return <Navigate to="/login" />;
    }

    if (isTokenExpired(token)) {
        console.log('Token expired, redirecting to login');
        localStorage.clear(); // Clear all localStorage
        return <Navigate to="/login" />;
    }

    // Additional role check from stored role and decoded token
    const decodedRole = getUserRole(token);
    console.log('Role checks:', {
        storedRole: userRole,
        decodedRole
    });

    if (userRole !== "admin" || decodedRole !== "admin") {
        console.log('Role mismatch, redirecting to login');
        return <Navigate to="/login" />;
    }

    return children;
};

export default AdminRoute;
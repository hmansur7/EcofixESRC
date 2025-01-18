import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp < Date.now() / 1000;
    } catch (error) {
        return true;
    }
};

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
        return <Navigate to="/login" />;
    }

    const pendingVerification = localStorage.getItem("pendingVerification");
    if (pendingVerification) {
        return <Navigate to="/verify-email" />;
    }

    return children;
};

export default PrivateRoute;
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
    const needsVerification = localStorage.getItem("pendingVerification");

    if (!token || isTokenExpired(token)) {
        localStorage.clear();
        return <Navigate to="/login" />;
    }

    if (needsVerification) {
        return <Navigate to="/verify-email" state={{ email: needsVerification }} />;
    }

    return children;
};

export default PrivateRoute;
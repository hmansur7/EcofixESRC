// frontend/src/middleware/Private.js
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("userRole") && localStorage.getItem("userName");
  const pendingVerification = localStorage.getItem("pendingVerification");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (pendingVerification) {
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default PrivateRoute;
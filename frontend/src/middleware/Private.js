// middleware/Private.js
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("authToken");
  const pendingVerification = localStorage.getItem("pendingVerification");

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect to verification page if email is pending verification
  if (pendingVerification) {
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default PrivateRoute;
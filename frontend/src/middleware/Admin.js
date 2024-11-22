import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole"); // Assume `userRole` is stored during login

  // If not authenticated or not an admin, redirect to login
  if (!token || role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;

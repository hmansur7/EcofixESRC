// frontend/src/middleware/Admin.js
import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("userRole");
  const isAuthenticated = localStorage.getItem("userName") && role;

  if (!isAuthenticated || role !== "admin") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AdminRoute;
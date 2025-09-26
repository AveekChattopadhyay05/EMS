import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RoleBasedRoutes({ children, requiredRole }) {
  const { user } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect if user doesn't have required role
  if (!requiredRole.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Render protected content
  return children;
}

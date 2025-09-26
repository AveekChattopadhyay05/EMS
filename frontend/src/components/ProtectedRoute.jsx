// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // If not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If a role is required and user doesn't match
  if (role && user.role !== role) {
    return <Navigate to="/login" />;
  }

  // Otherwise, show the protected page
  return children;
}

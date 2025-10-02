import React from "react";
import { useAuth } from "oidc-react";
import { Navigate } from "react-router-dom";

const PrivateWrapper = ({ children }) => {
  const auth = useAuth();
  const user = auth?.userData;

  console.log("🔐 PrivateWrapper - userData:", user);

  // Fallback loading state
  const isLoading = user === undefined;

  if (isLoading) {
    console.log("⏳ Waiting for auth to resolve...");
    return null; // oppure uno spinner
  }

  if (!user) {
    console.log("⛔️ No user found, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ User is authenticated, rendering UI");
  return children;
};

export default PrivateWrapper;

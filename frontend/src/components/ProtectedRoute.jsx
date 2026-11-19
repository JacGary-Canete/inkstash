import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRole, children }) {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: "2rem" }}>Checking session...</p>;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    const fallback = user.role === "ARTIST" ? "/artist/dashboard" : "/client/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
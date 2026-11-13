import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isAdmin } = useAuth();

    // Check if user is logged in
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check if admin access is required
    if (adminOnly && !isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default ProtectedRoute;


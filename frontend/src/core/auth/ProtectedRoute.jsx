import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading, hasRole } = useAuth();

    if (loading) return <div className="p-5 text-center">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return <Navigate to="/forbidden" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

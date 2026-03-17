/**
 * Utility to get the correct dashboard path based on user role.
 */
export const getDashboardPath = (roleName) => {
    switch (roleName) {
        case 'ADMIN':
            return '/dashboard/admin';
        case 'MANAGER':
            return '/dashboard/manager';
        case 'VISITOR':
            return '/dashboard/visitor';
        default:
            return '/login';
    }
};

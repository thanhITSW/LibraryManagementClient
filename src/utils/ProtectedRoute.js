import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element, isLoggedIn, userRole, requiredRole, allowGuest, requiredNotLogged }) => {
    // Chặn người dùng đã đăng nhập truy cập, sau đó chuyển hướng về trang chủ
    if (requiredNotLogged && isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    // Cho phép khách truy cập khi chưa đăng nhập
    if (allowGuest && !isLoggedIn) {
        return element;
    }

    // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Nếu yêu cầu role cụ thể (khi đã đăng nhập) nhưng user không có role đó
    if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/" replace />;
        }
    }

    // Đã đăng nhập và các điều kiện khác phù hợp
    return element;
};

export default ProtectedRoute;

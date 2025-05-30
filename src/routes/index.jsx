import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Login from "../auth/login/index.jsx";
import Dashboard from "../project/index.jsx";
import DashboardLayout from "../project/layout/index.jsx";
import NotFound from "../common/notFound/index.jsx";
import { selectIsLogin, selectUserRole } from "../auth/services/authSlice";
import Profile from "../project/module/profile/index.jsx";
import Lead from "../project/module/crm/lead/index.jsx";
import Contact from "../project/module/crm/contact/index.jsx";
import CRMSystem from "../project/module/crm/system/index.jsx";
import Role from "../project/module/role/index.jsx";
import User from "../project/module/user/index.jsx";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isLoggedIn = useSelector(selectIsLogin);
    const userRole = useSelector(selectUserRole);

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to role-specific dashboard
    if (userRole === 'admin') {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/admin')) {
            return <Navigate to={`/admin${currentPath}`} replace />;
        }
    }

    return children;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const isLoggedIn = useSelector(selectIsLogin);
    const userRole = useSelector(selectUserRole);

    if (isLoggedIn) {
        return userRole === 'admin'
            ? <Navigate to="/admin/dashboard" replace />
            : <Navigate to="/" replace />;
    }
    return children;
};

const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicRoute><Login /></PublicRoute>,
    },
    {
        path: "/login",
        element: <PublicRoute><Login /></PublicRoute>,
    },
    {
        path: "/admin",
        element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="dashboard" replace />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "role",
                element: <Role />
            },
            {
                path: "user",
                element: <User />
            },
            {
                path: "crm",
                children: [
                    {
                        path: "lead",
                        element: <Lead />
                    },
                    {
                        path: "contact",
                        element: <Contact />
                    },
                    {
                        path: "system",
                        element: <CRMSystem />,
                        children: [
                            {
                                path: ":name",
                                element: <CRMSystem />
                            },
                            {
                                index: true,
                                element: <Navigate to="pipeline" replace />
                            }
                        ]
                    }
                ]
            },
            {
                path: "profile",
                element: <Profile />
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />,
    }
]);

export default router;

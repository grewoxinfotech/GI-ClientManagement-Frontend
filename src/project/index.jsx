import React, { useEffect, useMemo } from 'react';
import { Typography } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { selectCurrentUser, selectIsLogin, selectUserRole } from '../auth/services/authSlice';
import { useGetRoleQuery } from '../auth/services/authApi';
import './dashboard.scss';

const { Title } = Typography;

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Dashboard = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const isLoggedIn = useSelector(selectIsLogin);
    const userRole = useSelector(selectUserRole);

    const skipRoleQuery = useMemo(() => {
        return !user?.role_id || !!userRole;
    }, [user?.role_id, userRole]);

    const { isLoading: isRoleLoading } = useGetRoleQuery(
        user?.role_id,
        {
            skip: skipRoleQuery,
            refetchOnMountOrArgChange: true
        }
    );

    const checkAuth = useMemo(() => {
        return () => {
            if (!isLoggedIn) {
                navigate('/login', { replace: true });
            }
        };
    }, [isLoggedIn, navigate]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (!user) {
        return null;
    }

    return (
        <motion.div
            className="dashboard-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Title level={2} className="dashboard-welcome-title">
                    {getGreeting()}, {user?.username || 'User'}!
                </Title>
                <Title level={4} className="dashboard-subtitle">
                    {userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                </Title>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard; 
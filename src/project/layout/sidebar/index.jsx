import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Tooltip, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, selectUserRole } from '../../../auth/services/authSlice';
import {
    RiDashboardFill,
    RiLogoutCircleFill,
    RiMessage2Fill,
    RiUserLine,
    RiTeamLine,
    RiCustomerService2Line,
    RiContactsLine,
    RiShieldUserLine,
    RiUserSettingsLine,
    RiArrowLeftSLine
} from 'react-icons/ri';
import './styles.scss';
import { useLogout } from '../../../utils/hooks/useLogout';

const { Sider } = Layout;
const { Title } = Typography;

const DashboardSidebar = ({ collapsed, isMobile, onBackClick }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const handleLogout = useLogout();
    const [openKeys, setOpenKeys] = useState([]);
    const [selectedKey, setSelectedKey] = useState('');

    useEffect(() => {
        // Set default selection to Dashboard if on root paths
        if (location.pathname === '/' || location.pathname === '/admin' || location.pathname === '/dashboard') {
            setSelectedKey(`${getBasePath()}/dashboard`);
            navigate(`${getBasePath()}/dashboard`);
            setOpenKeys([]); // Close all dropdowns
        } else {
            // Set selected key based on current path
            setSelectedKey(location.pathname);

            // Open appropriate submenu based on current path
            if (location.pathname.includes('/crm')) {
                setOpenKeys(['crm']);
            } else {
                setOpenKeys([]); // Close all dropdowns when not in CRM
            }
        }
    }, [location.pathname]);

    const handleOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    const getBasePath = () => {
        return userRole === 'admin' ? '/admin' : '/dashboard';
    };

    const menuItems = [
        {
            key: `${getBasePath()}/dashboard`,
            icon: <RiDashboardFill />,
            label: 'Dashboard'
        },
        {
            key: `${getBasePath()}/role`,
            icon: <RiShieldUserLine />,
            label: 'Role '
        },
        {
            key: `${getBasePath()}/user`,
            icon: <RiUserSettingsLine />,
            label: 'User '
        },
        {
            key: 'crm',
            icon: <RiMessage2Fill />,
            label: 'CRM',
            children: [
                {
                    key: `${getBasePath()}/crm/lead`,
                    icon: <RiTeamLine />,
                    label: 'Lead'
                },
                {
                    key: `${getBasePath()}/crm/contact`,
                    icon: <RiContactsLine />,
                    label: 'Contact'
                },
                {
                    key: `${getBasePath()}/crm/system`,
                    icon: <RiCustomerService2Line />,
                    label: 'CRM System'
                }
            ]
        }
    ];

    const handleMenuClick = ({ key }) => {
        setSelectedKey(key);

        // Close all dropdowns if not clicking on a CRM item
        if (!key.includes('/crm')) {
            setOpenKeys([]);
        } else {
            setOpenKeys(['crm']);
        }

        navigate(key);

        // Close mobile sidebar after navigation
        if (isMobile && onBackClick) {
            onBackClick();
        }
    };

    const logoVariants = {
        expanded: {
            fontSize: '24px',
            transition: { duration: 0.2, ease: 'easeInOut' }
        },
        collapsed: {
            fontSize: '20px',
            transition: { duration: 0.2, ease: 'easeInOut' }
        }
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={256}
            collapsedWidth={80}
            className="dashboard-sidebar"
            style={{
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                background: 'var(--bg-primary)',
                boxShadow: '0 1px 4px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out'
            }}
        >
            <div className="sidebar-logo">
                {isMobile && (
                    <Button
                        type="text"
                        icon={<RiArrowLeftSLine />}
                        onClick={onBackClick}
                        className="back-button"
                        style={{ outline: 'none' }}
                    />
                )}
                <Title level={4} className="sidebar-logo-text">
                    {collapsed && !isMobile ? 'A' : 'Admin'}
                </Title>
            </div>

            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                openKeys={openKeys}
                onOpenChange={handleOpenChange}
                items={menuItems}
                onClick={handleMenuClick}
            />

            <div className="sidebar-footer">
                {collapsed && !isMobile ? (
                    <div className="sidebar-footer-collapsed">
                        <Tooltip title={user?.username || 'User'} placement="right">
                            <Avatar className="sidebar-footer-avatar">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        </Tooltip>
                        <Tooltip title="Profile" placement="right">
                            <div className="profile-link" onClick={() => navigate(`${getBasePath()}/profile`)}>
                                <RiUserLine />
                            </div>
                        </Tooltip>
                        <Tooltip title="Logout" placement="right">
                            <div className="sidebar-footer-logout" onClick={handleLogout}>
                                <RiLogoutCircleFill />
                            </div>
                        </Tooltip>
                    </div>
                ) : (
                    <div className="sidebar-footer-expanded">
                        <div className="sidebar-footer-user">
                            <Avatar className="sidebar-footer-avatar">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            <div className="sidebar-footer-info">
                                <div className="sidebar-footer-name">
                                    {user?.username || 'User'}
                                </div>
                                <div className="sidebar-footer-role">
                                    {userRole}
                                </div>
                            </div>
                        </div>
                        <div className="profile-link" onClick={() => navigate(`${getBasePath()}/profile`)}>
                            <RiUserLine />
                            <span>Profile</span>
                        </div>
                        <div className="sidebar-footer-logout" onClick={handleLogout}>
                            <RiLogoutCircleFill />
                            <span>Logout</span>
                        </div>
                    </div>
                )}
            </div>
        </Sider>
    );
};

export default DashboardSidebar;

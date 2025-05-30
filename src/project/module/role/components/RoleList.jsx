import React from 'react';
import { Table, Button, Space, Tooltip, Popconfirm, Dropdown, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { RiFileListLine } from 'react-icons/ri';

const RoleList = ({
    roles = [],
    isLoading = false,
    currentPage = 1,
    pageSize = 10,
    total = 0,
    onPageChange,
    onEdit,
    onView,
    onDelete
}) => {
    // Function to format date in "12 January 2025" format
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        const date = new Date(timestamp);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Function to summarize permissions
    const getPermissionsSummary = (permissions) => {
        if (!permissions) return "No permissions";

        try {
            // If permissions is a string, try to parse it
            const permissionsObj = typeof permissions === 'string'
                ? JSON.parse(permissions)
                : permissions;

            // Count the number of modules with permissions
            const moduleCount = Object.keys(permissionsObj).length;

            if (moduleCount === 0) return "No permissions";

            // Check if it has admin access
            const hasAdminAccess = Object.values(permissionsObj).some(
                module => module.create && module.read && module.update && module.delete
            );

            let summary = `${moduleCount} ${moduleCount === 1 ? 'module' : 'modules'}`;
            if (hasAdminAccess) {
                summary += ", Full access";
            }

            return summary;
        } catch (error) {
            return "Invalid format";
        }
    };

    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View',
            onClick: () => onView(record)
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => onEdit(record)
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            onClick: () => onDelete(record),
            danger: true,
            disabled: record.role_name === 'admin'
        }
    ];

    const columns = [
        {
            title: 'Role Name',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (text, record) => (
                <div className="role-name-container">
                    <span className="role-name">{text}</span>
                    {record.role_name === 'admin' && (
                        <span className="role-system-label">System</span>
                    )}
                </div>
            )
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (permissions) => (
                <span className="permissions-text">{getPermissionsSummary(permissions)}</span>
            )
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date)
        },
        {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => formatDate(date)
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Dropdown
                    menu={{ items: getActionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <button className="btn btn-icon btn-ghost">
                        <MoreOutlined />
                    </button>
                </Dropdown>
            )
        }
    ];

    return (
        <div className="role-list">
            <Table
                columns={columns}
                dataSource={roles.map(role => ({ ...role, key: role.id }))}
                loading={isLoading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: onPageChange,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} roles`
                }}
                className="role-table"
            />
        </div>
    );
};

export default RoleList; 
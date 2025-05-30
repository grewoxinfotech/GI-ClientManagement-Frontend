import React, { useState } from 'react';
import { Table, Dropdown, Input, Button, Space, Empty } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import UserCard from './UserCard.jsx';

const UserList = ({ users, roleMap, isLoading, viewMode, pagination, onEdit, onView, onDelete }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        const date = new Date(timestamp);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters, confirm) => {
        clearFilters();
        setSearchText('');
        confirm();
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        className="btn btn-filter btn-primary"
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, confirm)}
                        className="btn btn-filter btn-reset"
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => (
            <SearchOutlined style={{ color: filtered ? 'var(--primary-color)' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        filteredValue: searchedColumn === dataIndex ? [searchText] : null
    });

    const getActionItems = (record) => [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View',
            onClick: () => onView?.(record)
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit',
            onClick: () => onEdit?.(record)
        },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: 'Delete',
            onClick: () => onDelete?.(record),
            danger: true
        }
    ];

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
            ...getColumnSearchProps('username')
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email')
        },
        {
            title: 'Role',
            dataIndex: 'role_id',
            key: 'role',
            render: (roleId) => roleMap[roleId] || 'N/A',
            ...getColumnSearchProps('role_id')
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        },
        {
            title: 'Updated At',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date, record) => formatDate(date || record.createdAt),
            sorter: (a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt)
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
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

    if (viewMode === 'grid') {
        return (
            <div className="user-grid">
                {users.length === 0 && !isLoading ? (
                    <Empty
                        className="empty-state"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No users found"
                    />
                ) : (
                    users.map(user => (
                        <UserCard
                            key={user.id}
                            user={user}
                            roleName={roleMap[user.role_id]}
                            onEdit={onEdit}
                            onView={onView}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </div>
        );
    }

    return (
        <div className="user-list">
            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={isLoading}
                onChange={(newPagination) => pagination.onChange(newPagination.current, newPagination.pageSize)}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} users`,
                    showQuickJumper: true
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No users found"
                        />
                    )
                }}
            />
        </div>
    );
};

export default UserList;
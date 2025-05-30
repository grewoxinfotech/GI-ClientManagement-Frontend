import React from 'react';
import { Table, Spin, Pagination, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { RiFilterLine } from 'react-icons/ri';
import FilterCard from './FilterCard';

const FilterList = ({
    viewMode,
    filters = [],
    isLoading,
    pagination,
    onPageChange,
    onEdit,
    onDelete
}) => {
    const getActionMenu = (filter) => {
        // Check if filter is created by SYSTEM
        const isSystemCreated = filter.created_by === 'SYSTEM';

        const menuItems = [
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit Filter',
                onClick: () => onEdit(filter)
            }
        ];

        // Only add delete option if not created by SYSTEM
        if (!isSystemCreated) {
            menuItems.push(
                {
                    type: 'divider'
                },
                {
                    key: 'delete',
                    icon: <DeleteOutlined style={{ color: 'var(--text-error)' }} />,
                    label: <span className="text-error">Delete Filter</span>,
                    danger: true,
                    onClick: () => onDelete(filter)
                }
            );
        }

        return { items: menuItems };
    };

    const renderActionButton = (filter) => (
        <Dropdown
            menu={getActionMenu(filter)}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="filter-actions-dropdown"
        >
            <button className="action-button">
                <MoreOutlined />
            </button>
        </Dropdown>
    );

    const renderTypeLabel = (type) => (
        <span className={`filter-type-tag ${type || 'general'}`}>
            {type?.toUpperCase() || 'GENERAL'}
        </span>
    );

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            render: (text) => <span className="filter-name">{text}</span>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'left',
            render: renderTypeLabel
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            align: 'left',
            render: (text) => text || 'System'
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'left',
            render: (date) => new Date(date).toLocaleDateString()
        },
        {
            title: 'Actions',
            width: 60,
            className: 'action-column',
            align: 'center',
            render: (_, filter) => renderActionButton(filter)
        }
    ];

    const renderEmptyState = () => (
        <div className="empty-state">
            <RiFilterLine className="empty-icon" />
            <p className="empty-text">No filters found. Create one to get started.</p>
        </div>
    );

    // Show loading state
    if (isLoading && filters.length === 0) {
        return <div className="center-spinner"><Spin size="large" /></div>;
    }

    // Show empty state if no filters
    if (filters.length === 0) {
        return renderEmptyState();
    }

    // Grid view with pagination
    if (viewMode === 'grid') {
        return (
            <div className="filter-container">
                <div className="filter-grid">
                    {filters.map(filter => (
                        <FilterCard
                            key={filter.id}
                            filter={filter}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>

                {/* Always show pagination */}
                <div className="grid-pagination">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={onPageChange}
                        showSizeChanger={true}
                        showTotal={(total) => `Total ${total} filters`}
                        showQuickJumper={true}
                    />
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="filter-list">
            <Table
                className="filter-table"
                columns={columns}
                dataSource={filters}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} filters`,
                    showQuickJumper: true,
                    onChange: onPageChange
                }}
                locale={{
                    emptyText: renderEmptyState()
                }}
            />
        </div>
    );
};

export default FilterList; 
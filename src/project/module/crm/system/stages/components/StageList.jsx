import React from 'react';
import { Table, Card, Row, Col, Empty, Spin, Button, Tag, Space, Pagination, Dropdown, Input } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import { RiRoadMapLine } from 'react-icons/ri';
import StageCard from './StageCard';
import dayjs from 'dayjs';
import { useGetPipelinesQuery } from '../../../../../../config/api/apiServices';

const StageList = ({
    viewMode,
    stages = [],
    isLoading,
    pagination,
    onPageChange,
    onEdit,
    onDelete
}) => {
    // Fetch pipelines data to show pipeline names
    const { data: pipelinesResponse } = useGetPipelinesQuery({ limit: 'all' });
    const pipelines = pipelinesResponse?.data?.items || [];

    // Get pipeline name by ID
    const getPipelineName = (pipelineId) => {
        const pipeline = pipelines.find(p => p.id === pipelineId);
        return pipeline ? pipeline.name : pipelineId;
    };

    const getActionMenu = (stage) => {
        // Check if stage is created by SYSTEM
        const isSystemCreated = stage.created_by === 'SYSTEM';

        const menuItems = [
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit Stage',
                onClick: () => onEdit(stage)
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
                    label: <span className="text-error">Delete Stage</span>,
                    danger: true,
                    onClick: () => onDelete(stage)
                }
            );
        }

        return { items: menuItems };
    };

    const renderActionButton = (stage) => (
        <Dropdown
            menu={getActionMenu(stage)}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="stage-actions-dropdown"
        >
            <button className="action-button">
                <MoreOutlined />
            </button>
        </Dropdown>
    );

    const renderTypeLabel = (type) => (
        <span className="type-label">
            {type.toUpperCase()}
        </span>
    );

    const renderDefault = (isDefault) => {
        return isDefault ? <span className="default-yes">YES</span> : <span className="default-no">No</span>;
    };

    // Columns for the table view
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            render: (text) => <span className="stage-name">{text}</span>
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'left',
            render: renderTypeLabel
        },
        {
            title: 'Default',
            dataIndex: 'is_default',
            key: 'is_default',
            align: 'left',
            render: renderDefault
        },
        {
            title: 'Pipeline',
            dataIndex: 'pipeline',
            key: 'pipeline',
            align: 'left',
            render: (pipelineId) => <span className="pipeline-name">{getPipelineName(pipelineId)}</span>
        },
        {
            title: 'Actions',
            width: 60,
            className: 'action-column',
            align: 'center',
            render: (_, stage) => renderActionButton(stage)
        }
    ];

    const renderEmptyState = () => (
        <div className="empty-state">
            <RiRoadMapLine className="empty-icon" />
            <p className="empty-text">No stages found. Create one to get started.</p>
        </div>
    );

    // Show loading state
    if (isLoading && stages.length === 0) {
        return <div className="center-spinner"><Spin size="large" /></div>;
    }

    // Show empty state if no stages
    if (stages.length === 0) {
        return renderEmptyState();
    }

    // Grid view with pagination
    if (viewMode === 'grid') {
        return (
            <div className="stage-container">
                <div className="stage-grid">
                    {stages.map(stage => (
                        <StageCard
                            key={stage.id}
                            stage={stage}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>

                {/* Always show pagination even if there are fewer items than page size */}
                <div className="grid-pagination">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={onPageChange}
                        showSizeChanger={true}
                        showTotal={(total) => `Total ${total} stages`}
                        showQuickJumper={true}
                    />
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="stage-list">
            <Table
                className="stage-table"
                columns={columns}
                dataSource={stages}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} stages`,
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

export default StageList; 
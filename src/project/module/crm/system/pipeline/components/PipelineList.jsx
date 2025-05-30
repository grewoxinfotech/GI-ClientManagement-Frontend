import React from 'react';
import { Table, Dropdown, Empty, Pagination, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, EyeOutlined } from '@ant-design/icons';
import { RiFlowChart } from 'react-icons/ri';
import PipelineCard from './PipelineCard';
import dayjs from 'dayjs';
import { useGetStagesQuery } from '../../../../../../config/api/apiServices';

const PipelineList = ({
    viewMode,
    pipelines = [],
    isLoading,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
    onView
}) => {
    // Fetch all stages to count by type for pipelines
    const { data: stagesResponse } = useGetStagesQuery({ limit: 100 });
    const allStages = stagesResponse?.data?.items || [];

    // Get total stages count for a pipeline
    const getStagesCount = (pipelineId) => {
        return allStages.filter(stage => stage.pipeline === pipelineId).length;
    };

    const getActionMenu = (pipeline) => {
        const stagesCount = getStagesCount(pipeline.id);
        const menuItems = [];

        // Check if pipeline is created by SYSTEM
        const isSystemCreated = pipeline.created_by === 'SYSTEM';

        // Only show View option if pipeline has stages
        if (stagesCount > 0) {
            menuItems.push({
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Pipeline',
                onClick: () => onView(pipeline)
            });
        }

        menuItems.push({
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit Pipeline',
            onClick: () => onEdit(pipeline)
        });

        // Only add delete option if not created by SYSTEM
        if (!isSystemCreated) {
            menuItems.push(
                {
                    type: 'divider'
                },
                {
                    key: 'delete',
                    icon: <DeleteOutlined style={{ color: 'var(--text-error)' }} />,
                    label: <span className="text-error">Delete Pipeline</span>,
                    danger: true,
                    onClick: () => onDelete(pipeline)
                }
            );
        }

        return { items: menuItems };
    };

    const renderActionButton = (pipeline) => (
        <Dropdown
            menu={getActionMenu(pipeline)}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="pipeline-actions-dropdown"
        >
            <button className="action-button">
                <MoreOutlined />
            </button>
        </Dropdown>
    );

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, pipeline) => (
                <span className="pipeline-name">
                    {text} <span className="pipeline-count">({getStagesCount(pipeline.id)})</span>
                </span>
            )
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <span>{dayjs(date).format('MMM DD, YYYY')}</span>
        },
        {
            title: 'Actions',
            width: 60,
            className: 'action-column',
            align: 'center',
            render: (_, pipeline) => renderActionButton(pipeline)
        }
    ];

    const renderEmptyState = () => (
        <div className="empty-state">
            <RiFlowChart className="empty-icon" />
            <p className="empty-text">No pipelines found. Create one to get started.</p>
        </div>
    );

    // Show loading state
    if (isLoading && pipelines.length === 0) {
        return <div className="center-spinner"><Spin size="large" /></div>;
    }

    // Show empty state if no pipelines
    if (pipelines.length === 0) {
        return renderEmptyState();
    }

    // Grid view with pagination
    if (viewMode === 'grid') {
        return (
            <div className="pipeline-container">
                <div className="pipeline-grid">
                    {pipelines.map(pipeline => (
                        <PipelineCard
                            key={pipeline.id}
                            pipeline={pipeline}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onView={onView}
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
                        showTotal={(total) => `Total ${total} pipelines`}
                        showQuickJumper={true}
                    />
                </div>
            </div>
        );
    }

    // List view
    return (
        <div className="pipeline-list">
            <Table
                className="pipeline-table"
                columns={columns}
                dataSource={pipelines}
                rowKey="id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} pipelines`,
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

export default PipelineList; 
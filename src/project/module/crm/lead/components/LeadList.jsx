import React, { useState } from 'react';
import { Table, Card, Row, Col, Empty, Spin, Button, Tag, Space, Pagination, Dropdown, Input, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { RiFileList3Line } from 'react-icons/ri';
import { useUpdateLeadMutation, useGetFiltersQuery } from '../../../../../config/api/apiServices';

const LeadList = ({
    leads = [],
    isLoading,
    viewMode,
    currentPage,
    pageSize,
    total,
    onPageChange,
    onEdit,
    onDelete,
    pipelines = [],
    stages = []
}) => {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [updateLead] = useUpdateLeadMutation();

    const { data: filtersResponse } = useGetFiltersQuery({ limit: 'all' });
    const filters = filtersResponse?.data?.items || [];
    const sources = filters.filter(filter => filter.type === 'source');

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'var(--text-error)';
            case 'medium':
                return 'var(--text-warning)';
            case 'low':
                return 'var(--text-success)';
            default:
                return 'var(--text-primary)';
        }
    };

    const getPipelineName = (pipelineId) => {
        if (!pipelineId) return "No Pipeline";
        const pipeline = pipelines.find(p => p.id === pipelineId);
        return pipeline ? pipeline.name : "No Pipeline";
    };

    const getStageName = (stageId) => {
        if (!stageId) return "No Stage";
        const stage = stages.find(s => s.id === stageId);
        return stage ? stage.name : "No Stage";
    };

    const getSourceName = (sourceId) => {
        if (!sourceId) return null;
        const source = sources.find(s => s.id === sourceId);
        return source ? source.name : null;
    };

    const renderPipelineStageInfo = (lead) => {
        const pipelineName = getPipelineName(lead.pipeline);
        const stageName = getStageName(lead.stage);

        return (
            <div className="pipeline-stage-info">
                <div className="pipeline-name">{pipelineName || "No Pipeline"}</div>
                <div className="stage-name">{stageName || "No Stage"}</div>
            </div>
        );
    };

    const handleStatusToggle = async (record, checked) => {
        try {
            const newStatus = checked ? 'open' : 'closed';
            await updateLead({
                id: record.id,
                data: {
                    ...record,
                    status: newStatus
                }
            }).unwrap();
        } catch (error) {
            // Error handling is done in parent component
        }
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
            danger: true
        }
    ];

    if (isLoading && leads.length === 0) {
        return <div className="center-spinner"><Spin size="large" /></div>;
    }

    const columns = [
        {
            title: 'Title',
            dataIndex: 'leadTitle',
            key: 'leadTitle',
            render: (title) => (
                <div style={{ fontWeight: 'bold' }}>{title}</div>
            ),
            sorter: (a, b) => a.leadTitle.localeCompare(b.leadTitle),
            ...getColumnSearchProps('leadTitle')
        },
        {
            title: 'Value',
            dataIndex: 'leadValue',
            key: 'leadValue',
            render: (value) => (
                <div className="value-display">
                    <span className="currency-symbol">₹</span>
                    <span className="value-amount">{parseFloat(value).toLocaleString()}</span>
                </div>
            ),
            sorter: (a, b) => a.leadValue - b.leadValue
        },
        {
            title: 'Pipeline / Stage',
            dataIndex: 'pipeline',
            key: 'pipeline',
            render: (_, record) => renderPipelineStageInfo(record),
        },
        {
            title: 'Source',
            dataIndex: 'source',
            key: 'source',
            render: (sourceId) => sourceId ? <span>{getSourceName(sourceId)}</span> : null,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Switch
                    checked={status === 'open'}
                    onChange={(checked) => handleStatusToggle(record, checked)}
                    checkedChildren="Open"
                    unCheckedChildren="Closed"
                />
            ),
            ...getColumnSearchProps('status')
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => priority ? <span style={{ fontWeight: 'bold', color: getPriorityColor(priority) }}>{priority}</span> : null,
            ...getColumnSearchProps('priority')
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

    return (
        <div className="lead-list-container">
            <Table
                columns={columns}
                dataSource={leads}
                rowKey="id"
                loading={isLoading}
                onChange={(pagination) => onPageChange(pagination.current, pagination.pageSize)}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} leads`,
                    showQuickJumper: true
                }}
                className="lead-table"
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No leads in this stage"
                            className="kanban-empty"
                        />
                    )
                }}
            />
        </div>
    );
};

export default LeadList;
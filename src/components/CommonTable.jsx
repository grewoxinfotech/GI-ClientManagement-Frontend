import React, { useState } from 'react';
import { Table, Dropdown, Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, MoreOutlined, FilterOutlined } from '@ant-design/icons';

const CommonTable = ({
    data = [],
    columns = [],
    isLoading = false,
    pagination = {
        current: 1,
        pageSize: 10,
        total: 0,
        onChange: () => { },
    },
    actionItems = [],
    extraProps = {},
    searchableColumns = [],
    dateColumns = []
}) => {
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
        onFilter: (value, record) => {
            if (dataIndex === 'source') {
                return record[dataIndex] === value;
            }

            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '';
        },
        filteredValue: searchedColumn === dataIndex ? [searchText] : null
    });

    const enhancedColumns = columns.map(column => {
        let enhancedColumn = { ...column };
        const dataIndex = column.dataIndex || column.name;

        if (searchableColumns.includes(dataIndex)) {
            enhancedColumn = {
                ...enhancedColumn,
                ...getColumnSearchProps(dataIndex)
            };
        }

        if (column.filters) {
            enhancedColumn.filterIcon = filtered => (
                <FilterOutlined style={{ color: filtered ? 'var(--primary-color)' : undefined }} />
            );
        }

        if (dateColumns.includes(dataIndex) && !column.render) {
            enhancedColumn.render = (value, record) => {
                const dateValue = value || (column.fallbackField && record[column.fallbackField]);
                return formatDate(dateValue);
            };
        }

        return enhancedColumn;
    });

    if (actionItems && actionItems.length > 0) {
        enhancedColumns.push({
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Dropdown
                    menu={{ items: actionItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <button className="btn btn-icon btn-ghost">
                        <MoreOutlined />
                    </button>
                </Dropdown>
            )
        });
    }

    return (
        <div className="common-table">
            <Table
                columns={enhancedColumns}
                dataSource={data}
                rowKey="id"
                loading={isLoading}
                onChange={(newPagination, filters, sorter) => {
                    pagination.onChange(newPagination.current, newPagination.pageSize);
                }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} ${extraProps.itemName || 'items'}`,
                    showQuickJumper: true
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={`No ${extraProps.itemName || 'items'} found`}
                        />
                    )
                }}
                {...extraProps}
            />
        </div>
    );
};

export default CommonTable; 
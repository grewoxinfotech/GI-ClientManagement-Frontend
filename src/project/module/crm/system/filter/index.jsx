import React, { useState, useEffect } from 'react';
import { Typography, Space, Modal, message, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { RiLayoutGridLine, RiListUnordered, RiFilterLine } from 'react-icons/ri';
import {
    useGetFiltersQuery,
    useCreateFilterMutation,
    useUpdateFilterMutation,
    useDeleteFilterMutation
} from '../../../../../config/api/apiServices';
import FilterList from './components/FilterList';
import FilterForm from './components/FilterForm';
import { ModalTitle } from '../../../../../components/AdvancedForm';
import './filter.scss';

const { Title } = Typography;
const { Option } = Select;

const Filter = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [formModal, setFormModal] = useState({ visible: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ visible: false, data: null });
    const [selectedType, setSelectedType] = useState('all');
    const [filteredData, setFilteredData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    // Always fetch all filters for client-side filtering
    const queryParams = { limit: 'all' };

    const { data: response, isLoading } = useGetFiltersQuery(queryParams);

    const [createFilter, { isLoading: isCreating }] = useCreateFilterMutation();
    const [updateFilter, { isLoading: isUpdating }] = useUpdateFilterMutation();
    const [deleteFilter, { isLoading: isDeleting }] = useDeleteFilterMutation();

    // Filter the data client-side based on selected type
    useEffect(() => {
        if (response?.data?.items) {
            const items = response.data.items;

            // Filter by type if needed
            const filtered = selectedType === 'all'
                ? items
                : items.filter(item => item.type === selectedType);

            setFilteredData(filtered);
            setTotalCount(filtered.length);

            // Apply pagination for both list and grid views
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            setDisplayData(filtered.slice(startIndex, endIndex));
        } else {
            setFilteredData([]);
            setDisplayData([]);
            setTotalCount(0);
        }
    }, [response, selectedType, currentPage, pageSize, viewMode]);

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleAdd = () => setFormModal({ visible: true, data: null });
    const handleEdit = (filter) => setFormModal({ visible: true, data: filter });
    const handleDelete = (filter) => setDeleteModal({ visible: true, data: filter });

    const handleFormCancel = () => setFormModal({ visible: false, data: null });
    const handleDeleteCancel = () => setDeleteModal({ visible: false, data: null });

    const handleFormSubmit = async (values) => {
        try {
            if (formModal.data) {
                await updateFilter({
                    id: formModal.data.id,
                    data: values
                }).unwrap();
                message.success('Filter updated successfully');
            } else {
                await createFilter(values).unwrap();
                message.success('Filter created successfully');
            }
            setFormModal({ visible: false, data: null });
        } catch (error) {
            message.error(`Failed to ${formModal.data ? 'update' : 'create'} filter: ${error.data?.message || error.message}`);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteFilter(deleteModal.data.id).unwrap();
            message.success('Filter deleted successfully');
            setDeleteModal({ visible: false, data: null });
        } catch (error) {
            message.error('Failed to delete filter');
        }
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setCurrentPage(1); // Reset to first page when changing type filter
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setCurrentPage(1); // Reset to first page when changing view mode
    };

    const filterTypes = [
        { value: 'tag', label: 'Tag' },
        { value: 'status', label: 'Status' },
        { value: 'label', label: 'Label' },
        { value: 'source', label: 'Source' },
        { value: 'category', label: 'Category' },
    ];

    return (
        <div className="filter">
            <div className="filter-header">
                <Title level={2} className="mfh_title">Filter</Title>
                <div className="filter-header-actions">
                    <Space size={8}>
                        <div className="type-filter">
                            <Select
                                placeholder="Select Type"
                                style={{ width: 180 }}
                                value={selectedType}
                                onChange={handleTypeChange}
                                suffixIcon={<RiFilterLine />}
                            >
                                <Option value="all">All Types</Option>
                                {filterTypes.map(type => (
                                    <Option key={type.value} value={type.value}>{type.label}</Option>
                                ))}
                            </Select>
                        </div>
                        <div className="view-toggle" data-mode={viewMode}>
                            <button
                                className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => handleViewModeChange('list')}
                            >
                                <RiListUnordered />
                            </button>
                            <button
                                className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => handleViewModeChange('grid')}
                            >
                                <RiLayoutGridLine />
                            </button>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                            <PlusOutlined /> Add Filter
                        </button>
                    </Space>
                </div>
            </div>
            <div className="filter-content">
                <FilterList
                    viewMode={viewMode}
                    filters={displayData}
                    isLoading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: totalCount,
                        onChange: handlePageChange
                    }}
                    onPageChange={handlePageChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                title={<ModalTitle icon={RiFilterLine} title={formModal.data ? 'Edit Filter' : 'Add Filter'} />}
                open={formModal.visible}
                onCancel={handleFormCancel}
                footer={null}
                width={600}
                className="modal"
                maskClosable={true}
                centered
            >
                <FilterForm
                    initialValues={formModal.data}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={isCreating || isUpdating}
                />
            </Modal>

            <Modal
                title={<ModalTitle icon={DeleteOutlined} title="Delete Filter" />}
                open={deleteModal.visible}
                onOk={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                okText="Delete"
                cancelText="Cancel"
                className="delete-modal"
                centered
                maskClosable={false}
                okButtonProps={{
                    danger: true,
                    loading: isDeleting
                }}
            >
                <p>Are you sure you want to delete filter "{deleteModal.data?.name}"?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Filter; 
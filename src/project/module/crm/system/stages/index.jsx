import React, { useState, useEffect } from 'react';
import { Typography, Space, Modal, message, Select, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { RiLayoutGridLine, RiListUnordered, RiRoadMapLine, RiFilterLine } from 'react-icons/ri';
import {
    useGetStagesQuery,
    useCreateStageMutation,
    useUpdateStageMutation,
    useDeleteStageMutation,
    useGetPipelinesQuery
} from '../../../../../config/api/apiServices';
import StageList from './components/StageList';
import StageForm from './components/StageForm';
import { ModalTitle } from '../../../../../components/AdvancedForm';
import './stage.scss';

const { Title } = Typography;
const { Option } = Select;

const Stages = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [formModal, setFormModal] = useState({ visible: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ visible: false, data: null });
    const [selectedPipeline, setSelectedPipeline] = useState('all');

    const { data: pipelinesResponse, isLoading: isPipelinesLoading } = useGetPipelinesQuery({
        limit: 'all' // Get all pipelines for dropdown
    });

    // Use same pagination for both view modes
    const { data: response, isLoading } = useGetStagesQuery({
        page: currentPage,
        limit: pageSize,
        pipeline: selectedPipeline === 'all' ? undefined : selectedPipeline
    });

    const [createStage, { isLoading: isCreating }] = useCreateStageMutation();
    const [updateStage, { isLoading: isUpdating }] = useUpdateStageMutation();
    const [deleteStage, { isLoading: isDeleting }] = useDeleteStageMutation();

    const stages = response?.data?.items || [];
    const total = response?.data?.total || 0;
    const pipelines = pipelinesResponse?.data?.items || [];

    // Reset to first page when changing view mode
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setCurrentPage(1);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleAdd = () => {
        setFormModal({ visible: true, data: null });
    };

    const handleEdit = (stage) => {
        setFormModal({ visible: true, data: stage });
    };

    const handleDelete = (stage) => {
        setDeleteModal({ visible: true, data: stage });
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ visible: false, data: null });
    };

    const handleFormCancel = () => {
        setFormModal({ visible: false, data: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteStage(deleteModal.data.id).unwrap();
            message.success('Stage deleted successfully');
            setDeleteModal({ visible: false, data: null });
        } catch (error) {
            message.error('Failed to delete stage');
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            if (formModal.data) {
                const { order, ...dataWithoutOrder } = values;
                await updateStage({
                    id: formModal.data.id,
                    data: dataWithoutOrder
                }).unwrap();
                message.success('Stage updated successfully');
            } else {
                await createStage(values).unwrap();
                message.success('Stage created successfully');
            }
            setFormModal({ visible: false, data: null });
        } catch (error) {
            message.error(`Failed to ${formModal.data ? 'update' : 'create'} stage: ${error.data?.message || error.message}`);
        }
    };

    const handlePipelineChange = (value) => {
        setSelectedPipeline(value);
        setCurrentPage(1); // Reset to first page when changing pipeline filter
    };

    return (
        <div className="stage">
            <div className="stage-header">
                <Title level={2} className="mfh_title">Stages</Title>
                <div className="stage-header-actions">
                    <Space size={16}>
                        {/* Pipeline Filter ડ્રોપડાઉન */}
                        <div className="pipeline-filter">
                            <Select
                                placeholder="Select Pipeline"
                                style={{ width: 220 }}
                                value={selectedPipeline}
                                onChange={handlePipelineChange}
                                loading={isPipelinesLoading}
                                suffixIcon={<RiFilterLine />}
                            >
                                <Option value="all">All Pipelines</Option>
                                {pipelines.map(pipeline => (
                                    <Option key={pipeline.id} value={pipeline.id}>{pipeline.name}</Option>
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
                            <PlusOutlined /> Add Stage
                        </button>
                    </Space>
                </div>
            </div>

            <div className="stage-content">
                <StageList
                    viewMode={viewMode}
                    stages={stages}
                    isLoading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        onChange: handlePageChange
                    }}
                    onPageChange={handlePageChange}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            <Modal
                title={<ModalTitle icon={RiRoadMapLine} title={formModal.data ? 'Edit Stage' : 'Add Stage'} />}
                open={formModal.visible}
                onCancel={handleFormCancel}
                footer={null}
                width={600}
                className="modal"
                maskClosable={true}
                centered
            >
                <StageForm
                    initialValues={formModal.data}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={isCreating || isUpdating}
                />
            </Modal>

            <Modal
                title={<ModalTitle icon={DeleteOutlined} title="Delete Stage" />}
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
                <p>Are you sure you want to delete stage "{deleteModal.data?.name}"?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Stages;

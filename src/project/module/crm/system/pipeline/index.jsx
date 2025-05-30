import React, { useState } from 'react';
import { Typography, Space, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { RiLayoutGridLine, RiListUnordered, RiFlowChart } from 'react-icons/ri';
import {
    useGetPipelinesQuery,
    useCreatePipelineMutation,
    useUpdatePipelineMutation,
    useDeletePipelineMutation
} from '../../../../../config/api/apiServices';
import PipelineList from './components/PipelineList';
import PipelineForm from './components/PipelineForm';
import PipelineView from './components/PipelineView';
import { ModalTitle } from '../../../../../components/AdvancedForm';
import './pipeline.scss';

const { Title } = Typography;

const Pipeline = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [formModal, setFormModal] = useState({ visible: false, data: null });
    const [viewModal, setViewModal] = useState({ visible: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ visible: false, data: null });

    const { data: response, isLoading } = useGetPipelinesQuery({
        page: currentPage,
        limit: pageSize
    });

    const [createPipeline, { isLoading: isCreating }] = useCreatePipelineMutation();
    const [updatePipeline, { isLoading: isUpdating }] = useUpdatePipelineMutation();
    const [deletePipeline, { isLoading: isDeleting }] = useDeletePipelineMutation();

    const pipelines = response?.data?.items || [];
    const total = response?.data?.total || 0;

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleAdd = () => {
        setFormModal({ visible: true, data: null });
    };

    const handleEdit = (pipeline) => {
        setFormModal({ visible: true, data: pipeline });
    };

    const handleView = (pipeline) => {
        setViewModal({ visible: true, data: pipeline });
    };

    const handleDelete = (pipeline) => {
        setDeleteModal({ visible: true, data: pipeline });
    };

    const handleDeleteCancel = () => {
        setDeleteModal({ visible: false, data: null });
    };

    const handleFormCancel = () => {
        setFormModal({ visible: false, data: null });
    };

    const handleViewCancel = () => {
        setViewModal({ visible: false, data: null });
    };

    const handleDeleteConfirm = async () => {
        try {
            await deletePipeline(deleteModal.data.id).unwrap();
            message.success('Pipeline deleted successfully');
            setDeleteModal({ visible: false, data: null });
        } catch (error) {
            message.error('Failed to delete pipeline');
        }
    };

    const handleFormSubmit = async (values) => {
        try {
            if (formModal.data) {
                await updatePipeline({
                    id: formModal.data.id,
                    data: values
                }).unwrap();
                message.success('Pipeline updated successfully');
            } else {
                await createPipeline(values).unwrap();
                message.success('Pipeline created successfully');
            }
            setFormModal({ visible: false, data: null });
        } catch (error) {
            message.error(`Failed to ${formModal.data ? 'update' : 'create'} pipeline: ${error.data?.message || error.message}`);
        }
    };

    return (
        <div className="pipeline">
            <div className="pipeline-header">
                <Title level={2} className="mfh_title">Pipeline</Title>
                <div className="pipeline-header-actions">
                    <Space size={8}>
                        <div className="view-toggle" data-mode={viewMode}>
                            <button
                                className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <RiListUnordered />
                            </button>
                            <button
                                className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <RiLayoutGridLine />
                            </button>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                            <PlusOutlined /> Add Pipeline
                        </button>
                    </Space>
                </div>
            </div>

            <div className="pipeline-content">
                <PipelineList
                    viewMode={viewMode}
                    pipelines={pipelines}
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
                    onView={handleView}
                />
            </div>

            <Modal
                title={<ModalTitle icon={RiFlowChart} title={formModal.data ? 'Edit Pipeline' : 'Add Pipeline'} />}
                open={formModal.visible}
                onCancel={handleFormCancel}
                footer={null}
                width={600}
                className="modal"
                maskClosable={true}
                centered
            >
                <PipelineForm
                    initialValues={formModal.data}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={isCreating || isUpdating}
                />
            </Modal>

            <Modal
                title={<ModalTitle icon={EyeOutlined} title={viewModal.data ? `${viewModal.data.name} Pipeline` : 'Pipeline Details'} />}
                open={viewModal.visible}
                onCancel={handleViewCancel}
                footer={null}
                width={800}
                className="modal"
                maskClosable={true}
                centered
            >
                {viewModal.data && (
                    <PipelineView
                        pipeline={viewModal.data}
                        onClose={handleViewCancel}
                        hideHeader={true}
                    />
                )}
            </Modal>

            <Modal
                title={<ModalTitle icon={DeleteOutlined} title="Delete Pipeline" />}
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
                <p>Are you sure you want to delete pipeline "{deleteModal.data?.name}"?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Pipeline; 
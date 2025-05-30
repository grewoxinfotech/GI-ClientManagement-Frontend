import React, { useState, useEffect } from 'react';
import { Typography, Modal, Space, message, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { RiListUnordered, RiFileList3Line } from 'react-icons/ri';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import LeadKanbanView from './components/LeadKanbanView';
import {
    useGetLeadsQuery,
    useDeleteLeadMutation,
    useCreateLeadMutation,
    useUpdateLeadMutation,
    useGetPipelinesQuery,
    useGetStagesQuery
} from '../../../../config/api/apiServices';
import { ModalTitle } from '../../../../components/AdvancedForm';
import './lead.scss';

const { Title } = Typography;
const { Option } = Select;

const Lead = () => {
    const [viewMode, setViewMode] = useState('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [filterParams, setFilterParams] = useState({});

    const [formModal, setFormModal] = useState({ visible: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ visible: false, data: null });

    const { data: pipelinesResponse } = useGetPipelinesQuery({ limit: 'all' });
    const pipelines = pipelinesResponse?.data?.items || [];

    useEffect(() => {
        if (!selectedPipeline && pipelines.length > 0) {
            setSelectedPipeline(pipelines[0].id);
        }
    }, [pipelines, selectedPipeline]);

    const { data: stagesResponse } = useGetStagesQuery({
        limit: 'all',
        pipeline: selectedPipeline || ''
    }, {
        skip: false
    });
    const stages = stagesResponse?.data?.items || [];

    const leadStages = selectedPipeline
        ? stages.filter(stage => stage.type === 'lead' && stage.pipeline === selectedPipeline)
        : stages.filter(stage => stage.type === 'lead');

    const { data: response, isLoading } = useGetLeadsQuery({
        page: currentPage,
        limit: pageSize,
        ...filterParams
    });

    const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
    const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
    const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();

    const leads = response?.data?.items || [];
    const total = response?.data?.total || 0;
    const currentPageFromServer = response?.data?.currentPage || 1;

    useEffect(() => {
        const params = {};
        if (selectedPipeline) {
            params.pipeline = selectedPipeline;
        }
        if (selectedStage) {
            params.stage = selectedStage;
        }
        setFilterParams(params);
        setCurrentPage(1);
    }, [selectedPipeline, selectedStage]);

    const handlePipelineChange = (value) => {
        setSelectedPipeline(value);
        setSelectedStage(null);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleAdd = () => setFormModal({ visible: true, data: null });
    const handleEdit = (lead) => setFormModal({ visible: true, data: lead });
    const handleDelete = (lead) => setDeleteModal({ visible: true, data: lead });

    const handleFormCancel = () => setFormModal({ visible: false, data: null });
    const handleDeleteCancel = () => setDeleteModal({ visible: false, data: null });

    const handleFormSubmit = async (values) => {
        try {
            if (formModal.data) {
                await updateLead({ id: formModal.data.id, data: values }).unwrap();
                message.success('Lead updated successfully');
            } else {
                await createLead(values).unwrap();
                message.success('Lead created successfully');
            }
            setFormModal({ visible: false, data: null });
        } catch (error) {
            message.error(`Failed to ${formModal.data ? 'update' : 'create'} lead: ${error.data?.message || error.message}`);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteLead(deleteModal.data.id).unwrap();
            message.success('Lead deleted successfully');
            setDeleteModal({ visible: false, data: null });
        } catch (error) {
            message.error('Failed to delete lead');
        }
    };

    const handleResetFilters = () => {
        setSelectedPipeline(null);
        setSelectedStage(null);
    };

    const renderView = () => {
        switch (viewMode) {
            case 'kanban':
                return (
                    <LeadKanbanView
                        leads={leads}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        pipelines={pipelines}
                        stages={stages}
                        selectedPipeline={selectedPipeline}
                    />
                );
            case 'list':
            default:
                return (
                    <div className="lead-list">
                        <LeadList
                            leads={leads}
                            isLoading={isLoading}
                            viewMode="list"
                            currentPage={currentPageFromServer}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={handlePageChange}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            pipelines={pipelines}
                            stages={stages}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="lead">
            <div className="lead-header">
                <Title level={2} className="mfh_title">Leads</Title>
                <div className="lead-header-actions">
                    <Space size={8}>
                        <Select
                            placeholder="All Pipelines"
                            style={{ width: '150px' }}
                            value={selectedPipeline}
                            onChange={handlePipelineChange}
                            allowClear={false}
                            showSearch
                            optionFilterProp="children"
                        >
                            {pipelines.map(pipeline => (
                                <Option key={pipeline.id} value={pipeline.id}>{pipeline.name}</Option>
                            ))}
                        </Select>
                        <div className="view-toggle" data-mode={viewMode}>
                            <button
                                className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <RiListUnordered />
                            </button>
                            <button
                                className={`btn btn-icon ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setViewMode('kanban')}
                                title="Kanban View"
                            >
                                <AppstoreOutlined />
                            </button>
                        </div>
                        <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                            <PlusOutlined /> Add Lead
                        </button>
                    </Space>
                </div>
            </div>

            {renderView()}

            <Modal
                title={<ModalTitle icon={RiFileList3Line} title={formModal.data ? 'Edit Lead' : 'Add Lead'} />}
                open={formModal.visible}
                onCancel={handleFormCancel}
                footer={null}
                width={800}
                className="modal"
                maskClosable={true}
                bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
            >
                <LeadForm
                    initialValues={formModal.data}
                    isSubmitting={isCreating || isUpdating}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    pipelines={pipelines}
                    stages={stages}
                />
            </Modal>

            <Modal
                title={<ModalTitle icon={DeleteOutlined} title="Delete Lead" />}
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
                <p>Are you sure you want to delete lead "{deleteModal.data?.leadTitle}"?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Lead;
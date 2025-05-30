import React, { useState, useEffect } from 'react';
import { Modal, message, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { RiFileList3Line } from 'react-icons/ri';
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
import ModuleLayout from '../../../../components/ModuleLayout';
import FancyLoader from '../../../../components/FancyLoader';
import './lead.scss';

const { Option } = Select;

const Lead = () => {
    const [viewMode, setViewMode] = useState('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [selectedPipeline, setSelectedPipeline] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [filterParams, setFilterParams] = useState({});

    // For loading all leads initially
    const [allLeads, setAllLeads] = useState([]);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [isClientSideFiltering, setIsClientSideFiltering] = useState(true);

    // For showing initial loader animation
    const [showInitialLoader, setShowInitialLoader] = useState(false);

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

    // Load all leads without pagination
    const { data: allLeadsResponse, isLoading: isAllLeadsLoading } = useGetLeadsQuery({
        limit: 'all'
    }, {
        skip: !isClientSideFiltering
    });

    // API call for filtered leads - only if not using client-side filtering
    const { data: response, isLoading: isFilteredLeadsLoading } = useGetLeadsQuery({
        page: currentPage,
        limit: pageSize,
        ...filterParams
    }, {
        skip: isClientSideFiltering
    });

    const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
    const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();
    const [updateLead, { isLoading: isUpdating }] = useUpdateLeadMutation();

    // Set all leads
    useEffect(() => {
        if (isClientSideFiltering && allLeadsResponse?.data?.items) {
            setAllLeads(allLeadsResponse.data.items);
        }
    }, [allLeadsResponse, isClientSideFiltering]);

    // Client-side filtering
    useEffect(() => {
        if (isClientSideFiltering && allLeads.length > 0) {
            let filtered = [...allLeads];

            if (selectedPipeline) {
                filtered = filtered.filter(lead => lead.pipeline === selectedPipeline);
            }

            if (selectedStage) {
                filtered = filtered.filter(lead => lead.stage === selectedStage);
            }

            // Pagination on client side
            const startIndex = (currentPage - 1) * pageSize;
            const paginatedLeads = filtered.slice(startIndex, startIndex + pageSize);

            setFilteredLeads({
                items: paginatedLeads,
                total: filtered.length,
                currentPage: currentPage
            });
        }
    }, [allLeads, selectedPipeline, selectedStage, currentPage, pageSize, isClientSideFiltering]);

    // Set data for server-side filtering
    const leads = isClientSideFiltering ?
        (filteredLeads.items || []) :
        (response?.data?.items || []);

    const total = isClientSideFiltering ?
        (filteredLeads.total || 0) :
        (response?.data?.total || 0);

    const currentPageFromServer = isClientSideFiltering ?
        currentPage :
        (response?.data?.currentPage || 1);

    // Update API filter parameters
    useEffect(() => {
        if (!isClientSideFiltering) {
            const params = {};
            if (selectedPipeline) {
                params.pipeline = selectedPipeline;
            }
            if (selectedStage) {
                params.stage = selectedStage;
            }
            setFilterParams(params);
            setCurrentPage(1);
        }
    }, [selectedPipeline, selectedStage, isClientSideFiltering]);

    const handlePipelineChange = (value) => {
        setSelectedPipeline(value);
        setSelectedStage(null);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
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

    const renderPipelineFilter = () => (
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
    );

    // Loading state
    const isLoading = isClientSideFiltering ? isAllLeadsLoading : isFilteredLeadsLoading;

    // Show fancy loader for initial 3 seconds
    if (showInitialLoader) {
        return (
            <FancyLoader
                message="Loading CRM Leads..."
                subMessage="Please wait while we prepare your lead data"
                subMessage2="Organizing pipelines and stages"
                processingText="INITIALIZING"
            />
        );
    }

    return (
        <ModuleLayout
            title="Leads"
            showViewToggle={true}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onAddClick={handleAdd}
            className="lead"
            extraHeaderContent={renderPipelineFilter()}
        >
            {viewMode === 'grid' ? (
                <LeadKanbanView
                    leads={leads}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pipelines={pipelines}
                    stages={stages}
                    selectedPipeline={selectedPipeline}
                />
            ) : (
                <div className="lead-list">
                    <LeadList
                        leads={leads}
                        isLoading={isLoading}
                        viewMode={viewMode}
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
            )}

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
        </ModuleLayout>
    );
};

export default Lead;
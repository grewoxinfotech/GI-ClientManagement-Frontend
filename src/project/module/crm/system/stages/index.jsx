import React, { useState, useEffect } from 'react';
import { message, Select } from 'antd';
import { RiRoadMapLine, RiFilterLine } from 'react-icons/ri';
import {
    useGetStagesQuery,
    useCreateStageMutation,
    useUpdateStageMutation,
    useDeleteStageMutation,
    useGetPipelinesQuery
} from '../../../../../config/api/apiServices';
import StageList from './components/StageList';
import StageForm from './components/StageForm';
import { SystemModule } from '../../system';
import './stage.scss';

const { Option } = Select;

const Stages = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [formModal, setFormModal] = useState({ visible: false, data: null });
    const [deleteModal, setDeleteModal] = useState({ visible: false, data: null });
    const [selectedPipeline, setSelectedPipeline] = useState('all');

    const { data: pipelinesResponse, isLoading: isPipelinesLoading } = useGetPipelinesQuery({
        limit: 'all'
    });

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

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        setCurrentPage(1);
    };

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleAdd = () => setFormModal({ visible: true, data: null });
    const handleEdit = (stage) => setFormModal({ visible: true, data: stage });
    const handleDelete = (stage) => setDeleteModal({ visible: true, data: stage });

    const handleFormCancel = () => setFormModal({ visible: false, data: null });
    const handleDeleteCancel = () => setDeleteModal({ visible: false, data: null });

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
        setCurrentPage(1);
    };

    const renderPipelineFilter = () => (
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
    );

    return (
        <SystemModule
            title="Stages"
            showViewToggle={true}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onAddClick={handleAdd}
            className="stage"
            extraHeaderContent={renderPipelineFilter()}
            formModal={formModal}
            deleteModal={deleteModal}
            onFormCancel={handleFormCancel}
            onDeleteCancel={handleDeleteCancel}
            onDeleteConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
            formTitle={formModal?.data ? 'Edit Stage' : 'Add Stage'}
            formIcon={<RiRoadMapLine />}
            deleteTitle="Delete Stage"
            deleteItemName="stage"
            formContent={
                <StageForm
                    initialValues={formModal?.data}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={isCreating || isUpdating}
                />
            }
        >
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
        </SystemModule>
    );
};

export default Stages;

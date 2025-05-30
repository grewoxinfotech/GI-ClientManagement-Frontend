import React, { lazy, Suspense } from 'react';
import { Menu, Spin, Modal, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
    LineChartOutlined,
    FunnelPlotOutlined,
    FilterOutlined,
    LoadingOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import ModuleLayout from '../../../../components/ModuleLayout';
import { ModalTitle } from '../../../../components/AdvancedForm';
import './system.scss';

// Lazy load components
const Pipeline = lazy(() => import('./pipeline'));
const Stages = lazy(() => import('./stages'));
const Filter = lazy(() => import('./filter'));

const SYSTEM_MODULES = {
    pipeline: {
        key: 'pipeline',
        label: 'Pipeline',
        icon: <LineChartOutlined />,
        component: Pipeline
    },
    stages: {
        key: 'stages',
        label: 'Stages',
        icon: <FunnelPlotOutlined />,
        component: Stages
    },
    filter: {
        key: 'filter',
        label: 'Filters',
        icon: <FilterOutlined />,
        component: Filter
    }
};

const LoadingSpinner = () => (
    <div className="loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <span>Loading module...</span>
    </div>
);

export const SystemModule = ({
    title,
    children,
    showViewToggle = true,
    viewMode,
    onViewModeChange,
    onAddClick,
    className = '',
    extraHeaderContent,
    formModal,
    deleteModal,
    viewModal,
    onFormCancel,
    onDeleteCancel,
    onViewCancel,
    onDeleteConfirm,
    isDeleting,
    formTitle,
    formIcon,
    deleteTitle,
    deleteItemName,
    viewTitle,
    formContent,
    viewContent
}) => {
    return (
        <ModuleLayout
            title={title}
            showViewToggle={showViewToggle}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onAddClick={onAddClick}
            className={className}
            extraHeaderContent={extraHeaderContent}
        >
            {children}

            {formModal && (
                <Modal
                    title={<ModalTitle icon={formIcon} title={formTitle} />}
                    open={formModal.visible}
                    onCancel={onFormCancel}
                    footer={null}
                    width={800}
                    className="modal"
                    maskClosable={true}
                    bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
                >
                    {formContent}
                </Modal>
            )}

            {viewModal && viewContent && (
                <Modal
                    title={<ModalTitle icon={viewModal.icon} title={viewTitle} />}
                    open={viewModal.visible}
                    onCancel={onViewCancel}
                    footer={null}
                    width={800}
                    className="modal"
                    maskClosable={true}
                >
                    {viewContent}
                </Modal>
            )}

            {deleteModal && (
                <Modal
                    title={<ModalTitle icon={DeleteOutlined} title={deleteTitle} />}
                    open={deleteModal.visible}
                    onOk={onDeleteConfirm}
                    onCancel={onDeleteCancel}
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
                    <p>Are you sure you want to delete {deleteItemName} "{deleteModal.data?.name}"?</p>
                    <p>This action cannot be undone.</p>
                </Modal>
            )}
        </ModuleLayout>
    );
};

const System = () => {
    const navigate = useNavigate();
    const { name } = useParams();

    const currentModule = name ? SYSTEM_MODULES[name] : SYSTEM_MODULES.pipeline;
    const CurrentComponent = currentModule?.component || Pipeline;

    const handleMenuClick = (key) => {
        navigate(`/admin/crm/system/${key}`);
    };

    return (
        <div className="system-container">
            <Menu
                mode="inline"
                className="system-menu"
                selectedKeys={[currentModule?.key || 'pipeline']}
                items={Object.values(SYSTEM_MODULES).map(module => ({
                    key: module.key,
                    icon: module.icon,
                    label: module.label,
                    onClick: () => handleMenuClick(module.key)
                }))}
            />
            <div className="system-content">
                <Suspense fallback={<LoadingSpinner />}>
                    <CurrentComponent />
                </Suspense>
            </div>
        </div>
    );
};

export default System; 
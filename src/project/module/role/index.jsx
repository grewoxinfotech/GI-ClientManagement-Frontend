import React, { useState } from 'react';
import { Typography, Modal, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { RiShieldUserLine } from 'react-icons/ri';
import RoleList from './components/RoleList';
import RoleForm from './components/RoleForm';
import RoleView from './components/RoleView';
import { ModalTitle } from '../../../components/AdvancedForm';
import {
    useGetRolesQuery,
    useDeleteRoleMutation,
    useGetRoleQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation
} from '../../../config/api/apiServices';
import './role.scss';

const { Title } = Typography;

const Role = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [formModal, setFormModal] = useState({ visible: false, data: null });
    const [viewModal, setViewModal] = useState({ visible: false, id: null });
    const [deleteModal, setDeleteModal] = useState({ visible: false, data: null });

    const { data: response, isLoading } = useGetRolesQuery({
        page: currentPage,
        limit: pageSize,
    });

    const { data: viewingRoleResponse, isLoading: isViewLoading } = useGetRoleQuery(
        viewModal.id,
        { skip: !viewModal.id }
    );

    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
    const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

    const roles = response?.data?.items || [];
    const total = response?.data?.total || 0;
    const currentPageFromServer = response?.data?.currentPage || 1;
    const viewingRole = viewingRoleResponse?.data;

    const filteredRoles = roles.filter(role => role.created_by !== 'ADMIN');

    const handlePageChange = (page, size) => {
        setCurrentPage(page);
        setPageSize(size);
    };

    const handleAdd = () => setFormModal({ visible: true, data: null });
    const handleEdit = (role) => setFormModal({ visible: true, data: role });
    const handleView = (role) => setViewModal({ visible: true, id: role.id });
    const handleDelete = (role) => setDeleteModal({ visible: true, data: role });

    const handleFormCancel = () => setFormModal({ visible: false, data: null });
    const handleViewCancel = () => setViewModal({ visible: false, id: null });
    const handleDeleteCancel = () => setDeleteModal({ visible: false, data: null });

    const handleFormSubmit = async (values) => {
        try {
            if (formModal.data) {
                await updateRole({
                    id: formModal.data.id,
                    data: values
                }).unwrap();
                message.success('Role updated successfully');
            } else {
                await createRole(values).unwrap();
                message.success('Role created successfully');
            }
            setFormModal({ visible: false, data: null });
        } catch (error) {
            message.error(`Failed to ${formModal.data ? 'update' : 'create'} role: ${error.data?.message || error.message}`);
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteRole(deleteModal.data.id).unwrap();
            message.success('Role deleted successfully');
            setDeleteModal({ visible: false, data: null });
        } catch (error) {
            message.error('Failed to delete role');
        }
    };

    return (
        <div className="role">
            <div className="role-header">
                <Title level={2} className="mfh_title">Roles</Title>
                <div className="role-header-actions">
                    <Space size={8}>
                        <button className="btn btn-primary btn-lg" onClick={handleAdd}>
                            <PlusOutlined /> Add Role
                        </button>
                    </Space>
                </div>
            </div>

            <RoleList
                roles={filteredRoles}
                isLoading={isLoading}
                currentPage={currentPageFromServer}
                pageSize={pageSize}
                total={total}
                onPageChange={handlePageChange}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
            />

            <Modal
                title={<ModalTitle icon={RiShieldUserLine} title={formModal.data ? 'Edit Role' : 'Add Role'} />}
                open={formModal.visible}
                onCancel={handleFormCancel}
                footer={null}
                width={800}
                className="modal"
                maskClosable={true}
            >
                <RoleForm
                    initialValues={formModal.data}
                    isSubmitting={isCreating || isUpdating}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </Modal>

            <RoleView
                role={viewingRole}
                isLoading={isViewLoading}
                visible={viewModal.visible}
                onClose={handleViewCancel}
            />

            <Modal
                title={<ModalTitle icon={DeleteOutlined} title="Delete Role" />}
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
                <p>Are you sure you want to delete role "{deleteModal.data?.role_name}"?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Role; 
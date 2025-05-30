import React from 'react';
import { Card } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { MdOutlineEmail, MdAccessTime } from 'react-icons/md';
import { FaUserTag } from 'react-icons/fa';

const UserCard = ({ user, roleName, onEdit, onView, onDelete }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        const date = new Date(timestamp);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <Card className="user-card" bordered={false}>
            <div className="user-card-header">
                <h3 className="user-card-title">{user.username}</h3>
            </div>

            <div className="user-card-content">
                <div className="user-card-info">
                    <MdOutlineEmail />
                    <span>{user.email}</span>
                </div>
                <div className="user-card-info">
                    <FaUserTag />
                    <span>{roleName || 'N/A'}</span>
                </div>
            </div>

            <div className="user-card-meta">
                <div>
                    <MdAccessTime />
                    Created {formatDate(user.createdAt)}
                </div>
                <div>
                    <MdAccessTime />
                    Updated {formatDate(user.updatedAt || user.createdAt)}
                </div>
            </div>

            <div className="user-card-actions">
                <button className="btn btn-primary btn-view" onClick={() => onView(user)}>
                    <EyeOutlined /> View Details
                </button>
                <button className="btn btn-icon btn-ghost" onClick={() => onEdit(user)}>
                    <EditOutlined />
                </button>
                <button className="btn btn-icon btn-ghost delete" onClick={() => onDelete(user)}>
                    <DeleteOutlined />
                </button>
            </div>
        </Card>
    );
};

export default UserCard;


import React from 'react';
import { Card } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { MdOutlineEmail, MdPhone, MdAccessTime } from 'react-icons/md';

const ContactCard = ({ contact, onEdit, onView, onDelete }) => {
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        const date = new Date(timestamp);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <Card className="contact-card">
            <div className="contact-card-header">
                <h3 className="contact-card-title">{contact.name}</h3>
            </div>

            <div className="contact-card-content">
                <div className="contact-card-info">
                    <MdOutlineEmail />
                    <span>{contact.email}</span>
                </div>
                <div className="contact-card-info">
                    <MdPhone />
                    <span>{contact.phone}</span>
                </div>
            </div>

            <div className="contact-card-meta">
                <div>
                    <MdAccessTime />
                    Created {formatDate(contact.createdAt)}
                </div>
                <div>
                    <MdAccessTime />
                    Updated {formatDate(contact.updatedAt || contact.createdAt)}
                </div>
            </div>

            <div className="contact-card-actions">
                <button className="btn btn-primary btn-view" onClick={() => onView(contact)}>
                    <EyeOutlined /> View Details
                </button>
                <button className="btn btn-icon btn-ghost" onClick={() => onEdit(contact)}>
                    <EditOutlined />
                </button>
                <button className="btn btn-icon btn-ghost delete" onClick={() => onDelete(contact)}>
                    <DeleteOutlined />
                </button>
            </div>
        </Card>
    );
};

export default ContactCard;
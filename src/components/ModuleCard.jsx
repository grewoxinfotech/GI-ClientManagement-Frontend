import React from 'react';
import { Card } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const ModuleCard = ({
    title,
    avatar,
    infoItems = [],
    metaItems = [],
    onView,
    onEdit,
    onDelete,
    item,
    viewButtonText = "View Details",
    statusBadge,
    extraContent
}) => {
    return (
        <Card className="module-card" bordered={false}>
            <div className="module-card-header">
                {avatar && <div className="module-card-avatar">{avatar}</div>}
                <h3 className="module-card-title">{title}</h3>
                {statusBadge && <div className="status-badge">{statusBadge}</div>}
            </div>

            <div className="module-card-content">
                {infoItems.map((info, index) => (
                    <div key={`info-${index}`} className="module-card-info">
                        {info.icon && info.icon}
                        {info.label && <span className="info-label">{info.label}:</span>}
                        {info.badge ? (
                            <span className="badge">{info.content}</span>
                        ) : (
                            <span>{info.content}</span>
                        )}
                    </div>
                ))}

                {extraContent}
            </div>

            {metaItems.length > 0 && (
                <div className="module-card-meta">
                    {metaItems.map((meta, index) => (
                        <div key={`meta-${index}`}>
                            {meta.icon && meta.icon}
                            <span>{meta.content}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="module-card-actions">
                <button className="btn btn-primary btn-view" onClick={() => onView && onView(item)}>
                    <EyeOutlined /> {viewButtonText}
                </button>
                {onEdit && (
                    <button className="btn btn-icon btn-ghost" onClick={() => onEdit(item)}>
                        <EditOutlined />
                    </button>
                )}
                {onDelete && (
                    <button className="btn btn-icon btn-ghost delete" onClick={() => onDelete(item)}>
                        <DeleteOutlined />
                    </button>
                )}
            </div>
        </Card>
    );
};

ModuleCard.propTypes = {
    title: PropTypes.string.isRequired,
    avatar: PropTypes.node,
    infoItems: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.node,
            content: PropTypes.node.isRequired,
            label: PropTypes.string,
            badge: PropTypes.bool
        })
    ),
    metaItems: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.node,
            content: PropTypes.node.isRequired
        })
    ),
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    item: PropTypes.object.isRequired,
    viewButtonText: PropTypes.string,
    statusBadge: PropTypes.node,
    extraContent: PropTypes.node
};

export default ModuleCard; 
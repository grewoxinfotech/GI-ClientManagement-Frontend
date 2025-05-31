import React from 'react';
import { Typography } from 'antd';
import { RiLayoutGridLine, RiListUnordered } from 'react-icons/ri';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Title } = Typography;

const ModuleLayout = ({
    title,
    children,
    showViewToggle = false,
    viewMode = 'list',
    onViewModeChange,
    actionButtons,
    className = '',
    onAddClick,
    showAddButton = true,
    addButtonText,
    extraHeaderContent
}) => {
    const singularTitle = title.endsWith('s') ? title.slice(0, -1) : title;
    const defaultAddButtonText = `Add ${singularTitle}`;

    const renderAddButton = () => {
        if (!showAddButton) return null;

        return (
            <button className="btn btn-primary add-button" onClick={onAddClick}>
                <PlusOutlined /> <span className="btn-text">{addButtonText || defaultAddButtonText}</span>
            </button>
        );
    };

    return (
        <div className={`module-container ${className}`}>
            <div className="module-header">
                <div className="module-header-title">
                    <Title level={2} className="mfh_title">{title}</Title>
                </div>
                <div className="module-header-actions">
                    {extraHeaderContent}
                    {showViewToggle && (
                        <div className="view-toggle" data-mode={viewMode}>
                            <button
                                className={`btn btn-icon ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => onViewModeChange('list')}
                                title="List View"
                            >
                                <RiListUnordered />
                            </button>
                            <button
                                className={`btn btn-icon ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => onViewModeChange('grid')}
                                title="Grid View"
                            >
                                <RiLayoutGridLine />
                            </button>
                        </div>
                    )}
                    {renderAddButton()}
                    {actionButtons}
                </div>
            </div>
            <div className="module-content">
                {children}
            </div>
        </div>
    );
};

ModuleLayout.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    showViewToggle: PropTypes.bool,
    viewMode: PropTypes.oneOf(['list', 'grid']),
    onViewModeChange: PropTypes.func,
    actionButtons: PropTypes.node,
    className: PropTypes.string,
    onAddClick: PropTypes.func,
    showAddButton: PropTypes.bool,
    addButtonText: PropTypes.string,
    extraHeaderContent: PropTypes.node
};

export default ModuleLayout; 
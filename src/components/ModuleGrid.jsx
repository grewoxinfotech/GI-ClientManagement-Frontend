import React from 'react';
import { Empty, Pagination } from 'antd';
import PropTypes from 'prop-types';

const ModuleGrid = ({
    items = [],
    renderItem,
    isLoading = false,
    emptyMessage = "No items found",
    className = "",
    pagination
}) => {
    if (items.length === 0 && !isLoading) {
        return (
            <Empty
                className="empty-state"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={emptyMessage}
            />
        );
    }

    return (
        <div className={`module-grid-container ${className}`}>
            <div className="module-grid">
                {items.map((item, index) => renderItem(item, index))}
            </div>

            {pagination && (
                <div className="grid-pagination">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={pagination.onChange}
                        showSizeChanger={pagination.showSizeChanger}
                        showTotal={pagination.showTotal}
                        showQuickJumper={pagination.showQuickJumper}
                    />
                </div>
            )}
        </div>
    );
};

ModuleGrid.propTypes = {
    items: PropTypes.array.isRequired,
    renderItem: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    emptyMessage: PropTypes.string,
    className: PropTypes.string,
    pagination: PropTypes.shape({
        current: PropTypes.number,
        pageSize: PropTypes.number,
        total: PropTypes.number,
        onChange: PropTypes.func,
        showSizeChanger: PropTypes.bool,
        showTotal: PropTypes.func,
        showQuickJumper: PropTypes.bool
    })
};

export default ModuleGrid; 
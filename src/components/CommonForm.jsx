import React, { useEffect } from 'react';
import { Form, Button, Space } from 'antd';
import PropTypes from 'prop-types';

const CommonForm = ({
    initialValues,
    isSubmitting,
    onSubmit,
    onCancel,
    form: externalForm,
    children,
    submitButtonText,
    cancelButtonText,
    layout = 'vertical',
    className = '',
}) => {
    const [form] = Form.useForm();
    const formInstance = externalForm || form;
    const isEditing = !!initialValues;

    useEffect(() => {
        if (initialValues) {
            formInstance.setFieldsValue(initialValues);
        } else {
            formInstance.resetFields();
        }
    }, [initialValues, formInstance]);

    const handleSubmit = (values) => {
        onSubmit(values);
    };

    return (
        <Form
            form={formInstance}
            layout={layout}
            onFinish={handleSubmit}
            className={`${className}`}
        >
            {children}

            <div className="form-actions">
                <Space size={16}>
                    <Button
                        onClick={onCancel}
                        className="btn btn-secondary"
                        type="default"
                    >
                        {cancelButtonText || 'Cancel'}
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        className="btn btn-primary"
                    >
                        {submitButtonText || (isEditing ? 'Update' : 'Create')}
                    </Button>
                </Space>
            </div>
        </Form>
    );
};

CommonForm.propTypes = {
    initialValues: PropTypes.object,
    isSubmitting: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    form: PropTypes.object,
    children: PropTypes.node.isRequired,
    submitButtonText: PropTypes.string,
    cancelButtonText: PropTypes.string,
    layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
    className: PropTypes.string,
};

export default CommonForm; 
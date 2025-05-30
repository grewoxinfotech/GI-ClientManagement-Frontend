import React, { lazy, Suspense } from 'react';
import { Menu, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
    LineChartOutlined,
    FunnelPlotOutlined,
    FilterOutlined,
    LoadingOutlined
} from '@ant-design/icons';
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
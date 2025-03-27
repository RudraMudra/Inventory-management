// client/src/components/viewForecasting.js

import { useEffect, useState, useCallback } from "react";
import { Card, Table, Input } from 'antd';
import axios from 'axios';

const ViewerForecasting = ({ theme, isAuthenticated, apiUrl }) => {
    const [forecasts, setForecasts] = useState([]);
    const [searchText, setSearchText] = useState('');

    const fetchForecasts = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const response = await axios.get(`${apiUrl}/forecast`);
            setForecasts(response.data);
        } catch (error) {
            console.error('Error fetching forecasts:', error);
        }
    }, [isAuthenticated, apiUrl]);

    useEffect(() => {
        fetchForecasts();
    }, [fetchForecasts]);

    const filteredForecasts = forecasts.filter((item) =>
        item.itemName.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Item Name',
            dataIndex: 'itemName',
            key: 'itemName',
            sorter: (a, b) => a.itemName.localeCompare(b.itemName),
        },
        {
            title: 'Current Quantity',
            dataIndex: 'currentQuantity',
            key: 'currentQuantity',
            sorter: (a, b) => a.currentQuantity - b.currentQuantity,
        },
        {
            title: 'Low Stock Threshold',
            dataIndex: 'lowStockThreshold',
            key: 'lowStockThreshold',
            sorter: (a, b) => a.lowStockThreshold - b.lowStockThreshold,
        },
        {
            title: 'Weekly Demand Forecast',
            dataIndex: 'weeklyForecast',
            key: 'weeklyForecast',
            render: (value) => value.toFixed(2),
            sorter: (a, b) => a.weeklyForecast - b.weeklyForecast,
        },
        {
            title: 'Days Until Low Stock',
            dataIndex: 'daysUntilLowStock',
            key: 'daysUntilLowStock',
            render: (days, record) => {
                if (days === -1) {
                    return <span style={{ color: 'gray' }}>Unknown (No transfer data)</span>;
                }
                if (days === 0 && record.currentQuantity <= record.lowStockThreshold) {
                    return <span style={{ color: 'red' }}>Already below threshold</span>;
                }
                return (
                    <span style={{ color: days < 7 ? 'red' : days < 14 ? 'orange' : 'green' }}>
                        {days} days
                    </span>
                );
            },
            sorter: (a, b) => a.daysUntilLowStock - b.daysUntilLowStock,
        },
        {
            title: 'Overstock Status',
            dataIndex: 'isOverstocked',
            key: 'isOverstocked',
            render: (isOverstocked, record) => {
                if (!record.hasTransferData) {
                    return <span style={{ color: 'gray' }}>Unknown (No transfer data)</span>;
                }
                return isOverstocked ? (
                    <span style={{ color: 'orange' }}>
                        Overstocked by {record.overstockAmount.toFixed(2)} units
                    </span>
                ) : (
                    <span style={{ color: 'green' }}>Not overstocked</span>
                );
            },
            filters: [
                { text: 'Overstocked', value: true },
                { text: 'Not Overstocked', value: false },
            ],
            onFilter: (value, record) => record.isOverstocked === value,
        },
    ];

    return (
        <Card
            title="Inventory Forecasting (Viewer)"
            style={{ marginTop: 16, background: theme === 'light' ? '#fff' : '#1f1f1f' }}
            styles={{
                body: {
                    background: theme === 'light' ? '#fff' : '#1f1f1f',
                    color: theme === 'light' ? '#000' : '#fff',
                },
            }}
        >
            <Input
                placeholder="Search by item name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginBottom: 16, width: 300 }}
            />
            <Table
                dataSource={filteredForecasts}
                columns={columns}
                rowKey="itemId"
                pagination={{ pageSize: 5 }}
                scroll={{ x: true }}
                loading={forecasts.length === 0}
                style={{ background: theme === 'light' ? '#fff' : '#1f1f1f' }}
                rowClassName={() => (theme === 'dark' ? 'dark-row' : '')}
            />
        </Card>
    );
};

export default ViewerForecasting;
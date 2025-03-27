// client/src/components/Forecasting.js
import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Button as AntButton, Modal, Form, InputNumber, message, Input } from 'antd';
import axios from 'axios';
import { handleExportCSV } from '../utils/exportCSV'; // Assuming this exists

const Forecasting = ({ theme, isAuthenticated, userRole, apiUrl }) => {
  const [forecasts, setForecasts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isReorderModalVisible, setIsReorderModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reorderForm] = Form.useForm();

  const fetchForecasts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await axios.get(`${apiUrl}/forecast`);
      setForecasts(response.data);
    } catch (error) {
      message.error('Failed to fetch demand forecasts');
      console.error('Error fetching forecasts:', error);
    }
  }, [isAuthenticated, apiUrl, setForecasts]); // Include dependencies of fetchForecasts

  useEffect(() => {
    fetchForecasts();
  }, [isAuthenticated, apiUrl, fetchForecasts]); // Include fetchForecasts in the dependency array

  const showReorderModal = (record) => {
    setSelectedItem(record);
    setIsReorderModalVisible(true);
    reorderForm.setFieldsValue({
      itemName: record.itemName,
      reorderQuantity: Math.ceil(record.weeklyForecast * 2) || 10,
    });
  };

  const handleReorder = async () => {
    try {
      const values = await reorderForm.validateFields();
      await axios.post(`${apiUrl}/reorder`, {
        itemId: selectedItem.itemId,
        quantity: values.reorderQuantity,
      });
      message.success(`Reorder request for ${selectedItem.itemName} placed successfully!`);
      setIsReorderModalVisible(false);
      reorderForm.resetFields();
      fetchForecasts();
    } catch (error) {
      message.error('Failed to place reorder request');
      console.error('Error placing reorder:', error);
    }
  };

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
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          {((record.daysUntilLowStock <= 7 && record.daysUntilLowStock !== -1) || record.currentQuantity <= record.lowStockThreshold) && (
            <AntButton
              type="primary"
              onClick={() => showReorderModal(record)}
              style={{ marginRight: 8 }}
              disabled={userRole !== 'admin' && userRole !== 'manager'}
            >
              Reorder
            </AntButton>
          )}
          {record.isOverstocked && record.hasTransferData && (
            <AntButton
              onClick={() =>
                message.info(
                  `Consider transferring ${record.overstockAmount.toFixed(2)} units of ${
                    record.itemName
                  } to another warehouse`
                )
              }
            >
              Suggest Transfer
            </AntButton>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Inventory Forecasting"
        style={{ marginTop: 16, background: theme === 'light' ? '#fff' : '#1f1f1f' }}
        styles={{
          body: {
            background: theme === 'light' ? '#fff' : '#1f1f1f',
            color: theme === 'light' ? '#000' : '#fff',
          },
        }}
        extra={
          <>
            <AntButton type="primary" onClick={fetchForecasts} style={{ marginRight: 8 }}>
              Refresh
            </AntButton>
            <AntButton type="primary" onClick={() => handleExportCSV(apiUrl, 'forecast')}>
              Export to CSV
            </AntButton>
          </>
        }
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

      <Modal
        title="Place Reorder Request"
        open={isReorderModalVisible}
        onOk={handleReorder}
        onCancel={() => {
          setIsReorderModalVisible(false);
          reorderForm.resetFields();
        }}
        okText="Submit Reorder"
        cancelText="Cancel"
      >
        <Form form={reorderForm} layout="vertical">
          <Form.Item name="itemName" label="Item Name">
            <Input disabled style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="reorderQuantity"
            label="Reorder Quantity"
            rules={[{ required: true, message: 'Please enter the reorder quantity' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Forecasting;
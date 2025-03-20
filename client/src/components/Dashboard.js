import React from 'react';
import { Card, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const Dashboard = ({ itemsData, userRole, handleExportCSV, theme }) => {
  const totalItems = itemsData?.totalItems || 0;
  const lowStockCount = itemsData?.items.filter(item => item.quantity <= item.lowStockThreshold).length || 0;
  const totalQuantity = itemsData?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Card title="Inventory Overview" style={{ marginBottom: '24px', background: theme.card }}>
      <p>Total Items: {totalItems}</p>
      <p>Total Quantity: {totalQuantity}</p>
      <p>Low Stock Items: {lowStockCount}</p>
      {userRole === 'admin' && (
        <Button icon={<DownloadOutlined />} onClick={handleExportCSV} style={{ marginTop: '16px' }}>
          Export Summary
        </Button>
      )}
    </Card>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Spin, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { handleExportCSV } from '../utils/exportCSV';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Analytics = ({ theme, isAuthenticated, userRole, apiUrl }) => {
  const [topSelling, setTopSelling] = useState([]);
  const [turnover, setTurnover] = useState([]);
  const [lowStockTrends, setLowStockTrends] = useState([]);
  const [warehouseUtilization, setWarehouseUtilization] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (!isAuthenticated) {
      message.error('Please log in to view analytics');
      return;
    }

    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Fetch Top-Selling Items
        const topSellingRes = await fetch(`${apiUrl}/analytics/top-selling`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const topSellingData = await topSellingRes.json();
        if (topSellingRes.ok) {
          setTopSelling(topSellingData);
        } else {
          message.error('Failed to fetch top-selling items');
        }

        // Fetch Stock Turnover Rates
        const turnoverRes = await fetch(`${apiUrl}/analytics/turnover`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const turnoverData = await turnoverRes.json();
        if (turnoverRes.ok) {
          setTurnover(turnoverData);
        } else {
          message.error('Failed to fetch turnover rates');
        }

        // Fetch Low Stock Trends
        const lowStockRes = await fetch(`${apiUrl}/analytics/low-stock-trends`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const lowStockData = await lowStockRes.json();
        if (lowStockRes.ok) {
          setLowStockTrends(lowStockData);
        } else {
          message.error('Failed to fetch low stock trends');
        }

        // Fetch Warehouse Utilization
        const utilizationRes = await fetch(`${apiUrl}/analytics/warehouse-utilization`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const utilizationData = await utilizationRes.json();
        if (utilizationRes.ok) {
          setWarehouseUtilization(utilizationData);
        } else {
          message.error('Failed to fetch warehouse utilization');
        }
      } catch (error) {
        message.error('Error fetching analytics data');
        console.error('Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [isAuthenticated, apiUrl, userRole]);

  // Top-Selling Items Table Columns
  const topSellingColumns = [
    {
      title: 'Item Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500, color: '#1d39c4' }}>{text}</span>,
    },
    {
      title: 'Total Actions',
      dataIndex: 'totalActions',
      key: 'totalActions',
    },
    {
      title: 'Total Quantity Moved',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
    },
  ];

  // Chart Data for Stock Turnover
  const turnoverChartData = {
    labels: turnover.map(item => item.name),
    datasets: [
      {
        label: 'Turnover Rate (Quantity/Day)',
        data: turnover.map(item => item.turnoverRate.toFixed(2)),
        backgroundColor: '#1890ff',
        borderColor: '#096dd9',
        borderWidth: 1,
      },
    ],
  };

  // Chart Data for Low Stock Trends
  const lowStockChartData = {
    labels: lowStockTrends.map(trend => trend.month),
    datasets: [
      {
        label: 'Low Stock Incidents',
        data: lowStockTrends.map(trend => trend.count),
        fill: false,
        borderColor: '#f5222d',
        tension: 0.1,
      },
    ],
  };

  // Chart Data for Warehouse Utilization
  const utilizationChartData = {
    labels: warehouseUtilization.map(wh => wh.name),
    datasets: [
      {
        label: 'Utilization (%)',
        data: warehouseUtilization.map(wh => wh.utilizationPercentage.toFixed(2)),
        backgroundColor: '#52c41a',
        borderColor: '#389e0d',
        borderWidth: 1,
      },
    ],
  };

  // Export Analytics Data as CSV
  const handleExportAnalytics = () => {
    const data = {
      topSelling: topSelling.map(item => ({
        Name: item.name,
        'Total Actions': item.totalActions,
        'Total Quantity Moved': item.totalQuantity,
      })),
      turnover: turnover.map(item => ({
        Name: item.name,
        'Turnover Rate (Quantity/Day)': item.turnoverRate.toFixed(2),
      })),
      lowStockTrends: lowStockTrends.map(trend => ({
        Month: trend.month,
        'Low Stock Incidents': trend.count,
      })),
      warehouseUtilization: warehouseUtilization.map(wh => ({
        Warehouse: wh.name,
        'Total Quantity': wh.totalQuantity,
        Capacity: wh.capacity,
        'Utilization (%)': wh.utilizationPercentage.toFixed(2),
      })),
    };

    // Export each section as a separate CSV file
    handleExportCSV(data.topSelling, 'top_selling_items.csv');
    handleExportCSV(data.turnover, 'stock_turnover.csv');
    handleExportCSV(data.lowStockTrends, 'low_stock_trends.csv');
    handleExportCSV(data.warehouseUtilization, 'warehouse_utilization.csv');
  };

  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <Spin size="large" style={{ display: 'block', textAlign: 'center', margin: '20px 0' }} />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ color: theme === 'dark' ? '#fff' : '#000' }}>Inventory Analytics</h2>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportAnalytics}
              disabled={topSelling.length === 0 && turnover.length === 0 && lowStockTrends.length === 0 && warehouseUtilization.length === 0}
              style={{
                background: '#1890ff',
                borderColor: '#1890ff',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '14px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#096dd9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
            >
              Export Analytics
            </Button>
          </div>

          {/* Top-Selling Items */}
          <Card
            title="Top-Selling Items"
            style={{
              marginBottom: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: theme === 'dark' ? '#2f2f2f' : '#fff',
            }}
            // headStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
          >
            {topSelling.length > 0 ? (
              <Table
                dataSource={topSelling}
                columns={topSellingColumns}
                rowKey="_id"
                pagination={false}
                bordered
                size="middle"
                style={{ background: theme === 'dark' ? '#2f2f2f' : '#fff' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: theme === 'dark' ? '#ccc' : '#888' }}>
                No top-selling items data available. Perform some transfers or reductions to see data here.
              </div>
            )}
          </Card>

          {/* Stock Turnover Rate */}
          <Card
            title="Stock Turnover Rate"
            style={{
              marginBottom: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: theme === 'dark' ? '#2f2f2f' : '#fff',
            }}
            // headStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
          >
            {turnover.length > 0 ? (
              <Bar
                data={turnoverChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top', labels: { color: theme === 'dark' ? '#fff' : '#000' } },
                    title: { display: true, text: 'Turnover Rate by Item', color: theme === 'dark' ? '#fff' : '#000' },
                  },
                  scales: {
                    x: { ticks: { color: theme === 'dark' ? '#fff' : '#000' } },
                    y: { ticks: { color: theme === 'dark' ? '#fff' : '#000' } },
                  },
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: theme === 'dark' ? '#ccc' : '#888' }}>
                No turnover rate data available. Perform some transfers or reductions to see data here.
              </div>
            )}
          </Card>

          {/* Low Stock Trends */}
          <Card
            title="Low Stock Trends"
            style={{
              marginBottom: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: theme === 'dark' ? '#2f2f2f' : '#fff',
            }}
            // headStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
          >
            {lowStockTrends.length > 0 ? (
              <Line
                data={lowStockChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top', labels: { color: theme === 'dark' ? '#fff' : '#000' } },
                    title: { display: true, text: 'Low Stock Incidents Over Time', color: theme === 'dark' ? '#fff' : '#000' },
                  },
                  scales: {
                    x: { ticks: { color: theme === 'dark' ? '#fff' : '#000' } },
                    y: { ticks: { color: theme === 'dark' ? '#fff' : '#000' } },
                  },
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: theme === 'dark' ? '#ccc' : '#888' }}>
                No low stock trends data available. Update item quantities to trigger low stock events.
              </div>
            )}
          </Card>

          {/* Warehouse Utilization */}
          <Card
            title="Warehouse Utilization"
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: theme === 'dark' ? '#2f2f2f' : '#fff',
            }}
            // headStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
          >
            {warehouseUtilization.length > 0 ? (
              <Bar
                data={utilizationChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top', labels: { color: theme === 'dark' ? '#fff' : '#000' } },
                    title: { display: true, text: 'Warehouse Utilization (%)', color: theme === 'dark' ? '#fff' : '#000' },
                  },
                  scales: {
                    x: { ticks: { color: theme === 'dark' ? '#fff' : '#000' } },
                    y: {
                      ticks: { color: theme === 'dark' ? '#fff' : '#000' },
                      max: 100,
                      beginAtZero: true,
                    },
                  },
                }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: theme === 'dark' ? '#ccc' : '#888' }}>
                No warehouse utilization data available. Add items to warehouses to see data here.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default Analytics;
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Pagination, message, Input, Menu, Button, Modal, Form, Space } from 'antd';
import { StockOutlined, BarChartOutlined, PieChartOutlined, BulbOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import ItemForm from './components/ItemForm';
import ItemTable from './components/ItemTable';
import ItemChart from './components/ItemChart';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import WarehouseModal from './components/WarehouseModal';
import TransferModal from './components/TransferModal';
import ItemsModal from './components/ItemsModal';
import { useAuth } from './hooks/useAuth';
import { useItems } from './hooks/useItems';
import { useWarehouses } from './hooks/useWarehouses';
import { useWarehouseItems } from './hooks/useWarehouseItems';
import { useCharts } from './hooks/useCharts';
import { useMutations } from './hooks/useMutations';
import { themeStyles } from './constants/themeStyles';
import { itemsPerPage, apiUrl } from './constants/config';
import { handleExportCSV } from './utils/exportCSV';
import './App.css';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  const [view, setView] = useState('table');
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehouseForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  // Authentication
  const { isAuthenticated, userRole, handleLogin, handleLogout } = useAuth();

  // Items
  const {
    itemsData,
    isLoading,
    currentPage,
    localSearchTerm,
    filters,
    handleSearchChange,
    handleSort,
    handleFilterChange,
    handlePageChange,
  } = useItems(isAuthenticated, view, apiUrl, itemsPerPage);

  // Warehouses
  const {
    warehousesData,
    warehousesLoading,
    warehouseQuantities,
    warehouseQuantitiesError,
    warehouseQuantitiesLoading,
  } = useWarehouses(isAuthenticated, view, apiUrl);

  // Warehouse Items
  const { warehouseItems, warehouseItemsLoading, warehouseItemsError } = useWarehouseItems(
    isAuthenticated,
    selectedWarehouse,
    isItemsModalVisible,
    apiUrl
  );

  // Charts
  const { barData, barLoading, barError, pieData, pieLoading, pieError } = useCharts(isAuthenticated, view, apiUrl);

  // Mutations
  const {
    addMutation,
    updateMutation,
    deleteMutation,
    transferMutation,
    warehouseMutation,
    deleteWarehouseMutation,
    logMutation,
  } = useMutations(apiUrl, view, itemsPerPage, currentPage, localSearchTerm, 'name', 'asc', filters);

  // Low Stock Check
  useEffect(() => {
    const checkLowStock = async () => {
      try {
        const res = await axios.get(`${apiUrl}/items/low-stock-alert`);
        if (res.data.length > 0) {
          message.warning(`Low stock on: ${res.data.map(item => item.name).join(', ')}`, 5);
        }
      } catch (err) {
        console.error('Low stock check failed:', err);
      }
    };
    const interval = setInterval(checkLowStock, 300000);
    return () => clearInterval(interval);
  }, []);

  // Log Mutations
  useEffect(() => {
    const logAction = (action, itemId) => {
      logMutation.mutate({ action, itemId, user: localStorage.getItem('userId') || 'anonymous', timestamp: new Date() });
    };
    const originalAdd = addMutation.mutate;
    const originalUpdate = updateMutation.mutate;
    const originalDelete = deleteMutation.mutate;
    addMutation.mutate = (values) => {
      logAction('add', values._id);
      originalAdd(values);
    };
    updateMutation.mutate = (args) => {
      logAction('update', args.id);
      originalUpdate(args);
    };
    deleteMutation.mutate = (id) => {
      logAction('delete', id);
      originalDelete(id);
    };
    return () => {
      addMutation.mutate = originalAdd;
      updateMutation.mutate = originalUpdate;
      deleteMutation.mutate = originalDelete;
    };
  }, [addMutation, updateMutation, deleteMutation, logMutation]);

  const handleTransfer = useCallback((itemId) => {
    const item = itemsData?.items.find(i => i._id === itemId);
    setSelectedItemId(itemId);
    setIsTransferModalVisible(true);
    transferForm.setFieldsValue({ fromWarehouse: item?.warehouse });
  }, [itemsData, transferForm]);

  const handleTransferOk = () => {
    transferForm.validateFields().then((values) => {
      const { fromWarehouse, toWarehouse, quantity } = values;
      if (quantity <= 0) {
        message.error('Quantity must be greater than 0');
        return;
      }
      transferMutation.mutate({
        itemId: selectedItemId,
        fromWarehouse,
        toWarehouse,
        quantity: Number(quantity),
      });
      setIsTransferModalVisible(false);
      transferForm.resetFields();
    }).catch((errorInfo) => {
      console.log('Validation failed:', errorInfo);
    });
  };

  const handleTransferCancel = () => {
    setIsTransferModalVisible(false);
    transferForm.resetFields();
  };

  const handleViewItems = (warehouseName) => {
    setSelectedWarehouse(warehouseName);
    setIsItemsModalVisible(true);
  };

  const handleItemsModalCancel = () => {
    setIsItemsModalVisible(false);
    setSelectedWarehouse(null);
  };

  const handleAdd = useCallback((values) => addMutation.mutate(values), [addMutation]);
  const handleUpdate = useCallback((id, updatedItem) => updateMutation.mutate({ id, updatedItem }), [updateMutation]);
  const handleDelete = useCallback((id) => deleteMutation.mutate(id), [deleteMutation]);

  const showWarehouseModal = (record = null) => {
    if (record) {
      warehouseForm.setFieldsValue(record);
    } else {
      warehouseForm.resetFields();
    }
    setIsWarehouseModalVisible(true);
  };

  const handleWarehouseOk = () => {
    warehouseForm.validateFields().then((values) => {
      warehouseMutation.mutate(values);
      setIsWarehouseModalVisible(false);
      warehouseForm.resetFields();
    });
  };

  const handleWarehouseCancel = () => {
    setIsWarehouseModalVisible(false);
    warehouseForm.resetFields();
  };

  const handleMenuClick = (e) => {
    switch (e.key) {
      case '1': setView('table'); break;
      case '2': setView('bar'); break;
      case '3': setView('pie'); break;
      case '4': setView('warehouses'); break;
      // case '5': handleExportCSV(apiUrl); break;
      case '5': toggleTheme(); break;
      case '6': handleLogout(); break;
      default: break;
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleCollapse = () => setCollapsed(!collapsed);

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canViewCharts = userRole !== 'viewer';

  const items = itemsData?.items || [];
  const totalItems = itemsData?.totalItems || 0;
  const warehouses = warehousesData || [];

  const warehousesWithQuantities = warehouses.map(warehouse => {
    const quantityData = warehouseQuantities.find(q => q.warehouse.toLowerCase() === warehouse.name.toLowerCase()) || { totalQuantity: 0 };
    return {
      ...warehouse,
      totalQuantity: quantityData.totalQuantity || 0,
    };
  });

  const warehouseColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text) => (
        <button
          onClick={() => handleViewItems(text)}
          style={{
            color: themeStyles[theme].text,
            background: 'none',
            border: 'none',
            padding: 0,
            font: 'inherit',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          type="button"
          aria-label={`View items in ${text}`}
        >
          {text}
        </button>
      ),
    },
    { title: 'Location', dataIndex: 'location', key: 'location', width: '25%' },
    {
      title: 'Total Quantity',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
      width: '20%',
    },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString(), width: '20%' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {userRole === 'admin' && (
            <>
              <Button onClick={() => showWarehouseModal(record)}>Edit</Button>
              <Button
                danger
                onClick={() => {
                  Modal.confirm({
                    title: 'Are you sure you want to delete this warehouse?',
                    content: `This will delete the warehouse "${record.name}".`,
                    onOk: () => deleteWarehouseMutation.mutate(record._id),
                    okText: 'Yes',
                    cancelText: 'No',
                  });
                }}
              >
                Delete
              </Button>
            </>
          )}
        </Space>
      ),
      width: '30%',
    },
  ];

  const itemColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', sorter: (a, b) => a.quantity - b.quantity },
    { title: 'Low Stock Threshold', dataIndex: 'lowStockThreshold', key: 'lowStockThreshold' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const isLowStock = record.quantity <= record.lowStockThreshold;
        return (
          <span style={{ color: isLowStock ? 'red' : 'green' }}>
            {isLowStock ? 'Low Stock' : 'In Stock'}
          </span>
        );
      },
      sorter: (a, b) => (a.quantity <= a.lowStockThreshold ? -1 : 1) - (b.quantity <= b.lowStockThreshold ? -1 : 1),
    },
  ];

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: themeStyles[theme].background }}>
      <Sider
        width={200}
        collapsed={collapsed || window.innerWidth < 768}
        collapsible
        trigger={null}
        style={{ background: themeStyles[theme].sider }}
      >
        <div style={{ padding: collapsed ? '16px 8px' : '16px', textAlign: 'center' }}>
          <StockOutlined style={{ color: themeStyles[theme].text, fontSize: '40px' }} />
          {!collapsed && <Title level={3} style={{ color: themeStyles[theme].text, margin: '8px 0 0', fontSize: '24px' }}>StockFlow</Title>}
        </div>
        <Menu
          theme={theme === 'light' ? 'light' : 'dark'}
          mode="inline"
          defaultSelectedKeys={['1']}
          onClick={handleMenuClick}
          style={{ background: themeStyles[theme].sider }}
        >
          <Menu.Item key="1" icon={<StockOutlined />}>Inventory</Menu.Item>
          <Menu.Item key="2" icon={<BarChartOutlined />}>Bar Chart</Menu.Item>
          <Menu.Item key="3" icon={<PieChartOutlined />}>Pie Chart</Menu.Item>
          <Menu.Item key="4" icon={<HomeOutlined />}>Warehouses</Menu.Item>
          <Menu.Item key="5" icon={<BulbOutlined />}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Menu.Item>
          <Menu.Item key="6" icon={<LogoutOutlined />}>Logout</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeStyles[theme].header,
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            style={{ fontSize: '16px', color: themeStyles[theme].text, display: window.innerWidth >= 768 ? 'block' : 'none' }}
          />
          <Title level={2} style={{ color: themeStyles[theme].text, margin: 0, fontSize: '28px' }}>
            {view === 'table' ? 'Inventory Management' :
              view === 'bar' ? 'Quantity by Warehouse' :
              view === 'pie' ? 'Stock Status Distribution' :
              'Warehouse Management'}
          </Title>
          <div style={{ width: '24px' }} />
        </Header>
        <Content style={{ padding: '24px', minWidth: window.innerWidth < 768 ? '100%' : 'auto' }}>
          <div
            style={{
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              background: themeStyles[theme].card,
              width: '100%',
              maxWidth: window.innerWidth < 768 ? '100%' : '1200px',
              margin: '0 auto',
              padding: '24px',
            }}
          >
            {isLoading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                Loading inventory data...
              </div>
            )}
            {isAuthenticated && !isLoading && view === 'table' && (
              <Dashboard
                itemsData={itemsData}
                userRole={userRole}
                handleExportCSV={() => handleExportCSV(apiUrl)}
                theme={themeStyles[theme]}
              />
            )}
            {view === 'table' && (
              <>
                {canEdit && <ItemForm onSubmit={handleAdd} style={{ marginBottom: '32px', display: window.innerWidth < 768 ? 'block' : 'flex', gap: '16px' }} />}
                <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <Input
                    placeholder="Search by name, warehouse, or 'low stock'"
                    value={localSearchTerm}
                    onChange={handleSearchChange}
                    className={theme === 'dark' ? 'ant-input-dark' : ''}
                    style={{ width: '200px', borderRadius: '4px', background: themeStyles[theme].input, color: themeStyles[theme].text }}
                  />
                  <Input
                    name="minQuantity"
                    placeholder="Min Quantity"
                    value={filters.minQuantity}
                    onChange={handleFilterChange}
                    style={{ width: '150px', borderRadius: '4px', background: themeStyles[theme].input, color: themeStyles[theme].text }}
                    disabled={!canEdit}
                  />
                  <Input
                    name="maxQuantity"
                    placeholder="Max Quantity"
                    value={filters.maxQuantity}
                    onChange={handleFilterChange}
                    style={{ width: '150px', borderRadius: '4px', background: themeStyles[theme].input, color: themeStyles[theme].text }}
                    disabled={!canEdit}
                  />
                </div>
                <ItemTable
                  items={items}
                  onUpdate={canEdit ? handleUpdate : () => message.error('Access denied')}
                  onDelete={canEdit ? handleDelete : () => message.error('Access denied')}
                  onSort={handleSort}
                  onTransfer={canEdit ? handleTransfer : () => message.error('Access denied')}
                  canEdit={canEdit}
                />
                <Pagination
                  current={currentPage}
                  total={totalItems}
                  pageSize={itemsPerPage}
                  onChange={handlePageChange}
                  style={{ marginTop: '32px', textAlign: 'right', padding: '16px 0' }}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                />
              </>
            )}
            {view === 'bar' && canViewCharts && (
              <>
                {barLoading && <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>Loading bar chart...</div>}
                {barError && <div style={{ textAlign: 'center', color: 'red' }}>Error loading bar chart: {barError.message}</div>}
                {!barLoading && !barError && <ItemChart type="bar" barData={barData} pieData={{}} />}
              </>
            )}
            {view === 'pie' && canViewCharts && (
              <>
                {pieLoading && <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>Loading pie chart...</div>}
                {pieError && <div style={{ textAlign: 'center', color: 'red' }}>Error loading pie chart: {pieError.message}</div>}
                {!pieLoading && !pieError && <ItemChart type="pie" barData={{}} pieData={pieData} />}
              </>
            )}
            {view === 'warehouses' && (
              <>
                {warehousesLoading && (
                  <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>
                    Loading warehouses...
                  </div>
                )}
                {warehouseQuantitiesLoading && (
                  <div style={{ display: 'block', textAlign: 'center', margin: '20px 0' }}>
                    Loading warehouse quantities...
                  </div>
                )}
                {warehouseQuantitiesError && (
                  <div style={{ textAlign: 'center', color: 'red', margin: '20px 0' }}>
                    Error loading warehouse quantities: {warehouseQuantitiesError.message}
                  </div>
                )}
                {!warehousesLoading && (
                  <>
                    <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {userRole === 'admin' && (
                        <Button
                          type="primary"
                          onClick={() => showWarehouseModal()}
                          style={{ marginBottom: '16px' }}
                        >
                          Add Warehouse
                        </Button>
                      )}
                      <Input
                        placeholder="Search by name"
                        value={localSearchTerm}
                        onChange={handleSearchChange}
                        className={theme === 'dark' ? 'ant-input-dark' : ''}
                        style={{ width: '200px', borderRadius: '4px', background: themeStyles[theme].input, color: themeStyles[theme].text }}
                      />
                    </div>
                    {warehouseQuantities.length === 0 && (
                      <div style={{ textAlign: 'center', color: themeStyles[theme].text, margin: '20px 0' }}>
                        No items found in any warehouse.
                      </div>
                    )}
                    <ItemTable
                      items={warehousesWithQuantities.filter(warehouse => warehouse.name.toLowerCase().includes(localSearchTerm.toLowerCase()))}
                      columns={warehouseColumns}
                      onUpdate={userRole === 'admin' ? (id, updatedItem) => showWarehouseModal(updatedItem) : () => message.error('Access denied')}
                      onDelete={userRole === 'admin' ? (id) => deleteWarehouseMutation.mutate(id) : () => message.error('Access denied')}
                      canEdit={userRole === 'admin'}
                      showTransfer={false}
                    />
                  </>
                )}
              </>
            )}
            {!canViewCharts && view !== 'table' && view !== 'warehouses' && (
              <div style={{ textAlign: 'center', color: themeStyles[theme].text }}>Access denied to charts</div>
            )}
          </div>
        </Content>
      </Layout>
      <WarehouseModal
        isVisible={isWarehouseModalVisible}
        onOk={handleWarehouseOk}
        onCancel={handleWarehouseCancel}
        warehouseForm={warehouseForm}
      />
      <TransferModal
        isVisible={isTransferModalVisible}
        onOk={handleTransferOk}
        onCancel={handleTransferCancel}
        transferForm={transferForm}
        items={items}
        selectedItemId={selectedItemId}
        warehouses={warehouses}
      />
      <ItemsModal
        isVisible={isItemsModalVisible}
        onCancel={handleItemsModalCancel}
        selectedWarehouse={selectedWarehouse}
        warehouseItems={warehouseItems}
        warehouseItemsLoading={warehouseItemsLoading}
        warehouseItemsError={warehouseItemsError}
        itemColumns={itemColumns}
        canEdit={canEdit}
        handleUpdate={handleUpdate}
        handleDelete={handleDelete}
        handleTransfer={handleTransfer}
      />
    </Layout>
  );
}

export default App;
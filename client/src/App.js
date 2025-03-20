import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Layout, Typography, Pagination, message, Input, Card, Menu, Button, Spin, Modal, Form, Space, InputNumber } from 'antd';
import { StockOutlined, DownloadOutlined, BarChartOutlined, PieChartOutlined, BulbOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, HomeOutlined } from '@ant-design/icons';
import ItemForm from './components/ItemForm';
import ItemTable from './components/ItemTable';
import ItemChart from './components/ItemChart';
import Login from './components/Login';
import debounce from 'lodash/debounce';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [view, setView] = useState('table');
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [filters, setFilters] = useState({ minQuantity: '', maxQuantity: '' });
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false); // New state for transfer modal
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [warehouseForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const itemsPerPage = 15;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const queryClient = useQueryClient();

  // Fetch items
  const { data: itemsData, isLoading } = useQuery({
    queryKey: ['items', currentPage, searchTerm, sortBy, sortOrder, filters],
    queryFn: async () => {
      const params = { page: currentPage, limit: itemsPerPage, search: searchTerm, sortBy, sortOrder };
      if (filters.minQuantity) params.minQuantity = filters.minQuantity;
      if (filters.maxQuantity) params.maxQuantity = filters.maxQuantity;
      const res = await axios.get(`${apiUrl}/items`, { params });
      return res.data;
    },
    enabled: isAuthenticated && view === 'table',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Fetch warehouses
  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/warehouses`);
      return res.data;
    },
    enabled: isAuthenticated && view === 'warehouses',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Fetch total quantities per warehouse
  const { data: warehouseQuantities = [], error: warehouseQuantitiesError } = useQuery({
    queryKey: ['warehouseQuantities'],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/warehouse-quantities`); // Changed to /warehouses/warehouse-quantities
      return res.data;
    },
    enabled: isAuthenticated && view === 'warehouses',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (err) => {
      console.error('Error fetching warehouse quantities:', err);
      message.error(`Failed to fetch warehouse quantities: ${err.response?.data?.message || err.message}`);
    },
  });

  // Fetch bar chart data
  const { data: barData, isLoading: barLoading, error: barError } = useQuery({
    queryKey: ['barChart'],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/items/bar-chart`);
      return res.data;
    },
    enabled: isAuthenticated && view === 'bar',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Fetch pie chart data
  const { data: pieData, isLoading: pieLoading, error: pieError } = useQuery({
    queryKey: ['pieChart'],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/items/pie-chart`);
      return res.data;
    },
    enabled: isAuthenticated && view === 'pie',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Add item mutation
  const addMutation = useMutation({
    mutationFn: (values) => axios.post(`${apiUrl}/items`, values),
    onSuccess: (res) => {
      if (view === 'table') {
        queryClient.setQueryData(['items', currentPage, searchTerm, sortBy, sortOrder, filters], (oldData) => {
          const newItems = [...(oldData?.items || []), res.data].slice(-itemsPerPage);
          return { ...oldData, items: newItems, totalItems: (oldData?.totalItems || 0) + 1 };
        });
      }
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['pieChart']);
      queryClient.invalidateQueries(['warehouseQuantities']); // Invalidate warehouse quantities on item add
      message.success('Item added successfully', 2);
    },
    onError: (err) => {
      message.error(`Failed to add item: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updatedItem }) => axios.put(`${apiUrl}/items/${id}`, updatedItem),
    onSuccess: (res) => {
      if (view === 'table') {
        queryClient.setQueryData(['items', currentPage, searchTerm, sortBy, sortOrder, filters], (oldData) => {
          const newItems = oldData?.items.map(item => (item._id === res.data._id ? res.data : item)) || [];
          return { ...oldData, items: newItems };
        });
      }
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['pieChart']);
      queryClient.invalidateQueries(['warehouseQuantities']); // Invalidate warehouse quantities on item update
      message.success('Item updated', 2);
    },
    onError: (err) => {
      message.error(`Failed to update item: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${apiUrl}/items/${id}`),
    onSuccess: () => {
      if (view === 'table') {
        queryClient.setQueryData(['items', currentPage, searchTerm, sortBy, sortOrder, filters], (oldData) => {
          const newItems = oldData?.items.filter(item => item._id !== deleteMutation.variables) || [];
          return { ...oldData, items: newItems, totalItems: (oldData?.totalItems || 0) - 1 };
        });
      }
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['pieChart']);
      queryClient.invalidateQueries(['warehouseQuantities']); // Invalidate warehouse quantities on item delete
      message.success('Item deleted', 2);
    },
    onError: (err) => {
      message.error(`Failed to delete item: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  // Transfer item mutation
  const transferMutation = useMutation({
    mutationFn: async ({ itemId, fromWarehouse, toWarehouse, quantity }) => {
      const res = await axios.post(`${apiUrl}/items/transfer`, { itemId, fromWarehouse, toWarehouse, quantity });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['items']);
      queryClient.invalidateQueries(['barChart']);
      queryClient.invalidateQueries(['warehouseQuantities']); // Invalidate warehouse quantities on transfer
      message.success(
        `Transferred ${variables.quantity} units of ${data.itemName} from ${variables.fromWarehouse} to ${variables.toWarehouse}`,
        2
      );
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred';
      message.error(`Failed to transfer item: ${errorMessage}`, 2);
    },
  });

  // Create or update warehouse mutation
  const warehouseMutation = useMutation({
    mutationFn: async (values) => {
      if (values._id) {
        // Update warehouse
        const res = await axios.put(`${apiUrl}/warehouses/${values._id}`, values);
        return res.data;
      } else {
        // Create warehouse
        const res = await axios.post(`${apiUrl}/warehouses`, values);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      message.success('Warehouse saved successfully', 2);
      warehouseForm.resetFields();
      setIsWarehouseModalVisible(false);
    },
    onError: (err) => {
      message.error(`Failed to save warehouse: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  // Delete warehouse mutation
  const deleteWarehouseMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${apiUrl}/warehouses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      message.success('Warehouse deleted successfully', 2);
    },
    onError: (err) => {
      message.error(`Failed to delete warehouse: ${err.response?.data?.message || err.message}`, 2);
    },
  });

  const handleTransfer = useCallback((itemId) => {
    setSelectedItemId(itemId); // Store the item ID
    setIsTransferModalVisible(true); // Open the modal
  }, []);

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

  const logMutation = useMutation({
    mutationFn: (logData) => axios.post(`${apiUrl}/logs`, logData),
    onError: (err) => console.error('Failed to log action:', err),
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      delete axios.defaults.headers.common['Authorization'];
      message.error('Please log in to continue');
    }
  }, []);

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
    const interval = setInterval(checkLowStock, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [apiUrl]);

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

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${apiUrl}/items/export`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'items.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('CSV exported successfully');
    } catch (err) {
      message.error(`Failed to export CSV: ${err.response?.data?.message || err.message}`);
      console.error('Export error:', err);
    }
  };

  const handleAdd = useCallback((values) => addMutation.mutate(values), [addMutation]);
  const handleUpdate = useCallback((id, updatedItem) => updateMutation.mutate({ id, updatedItem }), [updateMutation]);
  const handleDelete = useCallback((id) => deleteMutation.mutate(id), [deleteMutation]);
  const handlePageChange = useCallback((page) => setCurrentPage(page), []);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const debouncedHandleSearchChange = debounce((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
  }, 300);

  const handleSearchChange = (e) => {
    setLocalSearchTerm(e.target.value);
    debouncedHandleSearchChange(e);
  };

  const handleSort = useCallback((sorter) => {
    if (sorter.order) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'descend' ? 'desc' : 'asc');
    } else {
      setSortBy('name');
      setSortOrder('asc');
    }
    setCurrentPage(1);
    queryClient.invalidateQueries(['items']);
  }, [queryClient]);

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
      case '5': handleExportCSV(); break;
      case '6': toggleTheme(); break;
      case '7': handleLogout(); break;
      default: break;
    }
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const toggleCollapse = () => setCollapsed(!collapsed);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
    delete axios.defaults.headers.common['Authorization'];
    message.success('Logged out successfully');
  };

  const themeStyles = {
    light: { background: '#fff7e6', sider: '#b7eb8f', header: '#b7eb8f', text: '#000', card: '#fff', input: '#fff' },
    dark: { background: '#001529', sider: '#001529', header: '#001529', text: '#fff', card: '#1f1f1f', input: '#2d2d2d' },
  };

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canViewCharts = userRole !== 'viewer';

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const items = itemsData?.items || [];
  const totalItems = itemsData?.totalItems || 0;
  const warehouses = warehousesData || [];

  // Map warehouse quantities to warehouses
  const warehousesWithQuantities = warehouses.map(warehouse => {
    const quantityData = warehouseQuantities.find(q => q.warehouse.toLowerCase() === warehouse.name.toLowerCase()) || { totalQuantity: 0 };
    return {
      ...warehouse,
      totalQuantity: quantityData.totalQuantity || 0,
    };
  });

  const Dashboard = ({ itemsData, userRole }) => {
    const totalItems = itemsData?.totalItems || 0;
    const lowStockCount = itemsData?.items.filter(item => item.quantity <= item.lowStockThreshold).length || 0;
    const totalQuantity = itemsData?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <Card title="Inventory Overview" style={{ marginBottom: '24px', background: themeStyles[theme].card }}>
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

  const warehouseColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: '25%' },
    { title: 'Location', dataIndex: 'location', key: 'location', width: '25%' },
    {
      title: 'Total Quantity',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      sorter: (a, b) => a.totalQuantity - b.totalQuantity,
      width: '20%'
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
          <Menu.Item key="5" icon={<DownloadOutlined />}>Export to CSV</Menu.Item>
          <Menu.Item key="6" icon={<BulbOutlined />}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Menu.Item>
          <Menu.Item key="7" icon={<LogoutOutlined />}>Logout</Menu.Item>
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
          <Card
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
              <Spin size="large" tip="Loading inventory data..." style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
            )}
            {isAuthenticated && !isLoading && view === 'table' && (
              <Dashboard itemsData={itemsData} userRole={userRole} />
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
                {barLoading && <Spin size="large" tip="Loading bar chart..." style={{ display: 'block', textAlign: 'center', margin: '20px 0' }} />}
                {barError && <div style={{ textAlign: 'center', color: 'red' }}>Error loading bar chart: {barError.message}</div>}
                {!barLoading && !barError && <ItemChart type="bar" barData={barData} pieData={{}} />}
              </>
            )}
            {view === 'pie' && canViewCharts && (
              <>
                {pieLoading && <Spin size="large" tip="Loading pie chart..." style={{ display: 'block', textAlign: 'center', margin: '20px 0' }} />}
                {pieError && <div style={{ textAlign: 'center', color: 'red' }}>Error loading pie chart: {pieError.message}</div>}
                {!pieLoading && !pieError && <ItemChart type="pie" barData={{}} pieData={pieData} />}
              </>
            )}
            {view === 'warehouses' && (
              <>
                {warehousesLoading && (
                  <Spin size="large" tip="Loading warehouses..." style={{ display: 'block', textAlign: 'center', margin: '20px 0' }} />
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
                    <ItemTable
                      items={warehousesWithQuantities.filter(warehouse => warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()))}
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
          </Card>
        </Content>
      </Layout>
      <Modal
        title={warehouseForm.getFieldValue('_id') ? 'Edit Warehouse' : 'Add Warehouse'}
        open={isWarehouseModalVisible}
        onOk={handleWarehouseOk}
        onCancel={handleWarehouseCancel}
      >
        <Form form={warehouseForm} layout="vertical">
          <Form.Item name="_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the warehouse name!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="location" label="Location">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Transfer Item"
        open={isTransferModalVisible}
        onOk={handleTransferOk}
        onCancel={handleTransferCancel}
      >
        <Form form={transferForm} layout="vertical">
          <Form.Item
            name="fromWarehouse"
            label="Source Warehouse"
            rules={[{ required: true, message: 'Please input the source warehouse!' }]}
          >
            <Input placeholder="e.g., WH1" />
          </Form.Item>
          <Form.Item
            name="toWarehouse"
            label="Destination Warehouse"
            rules={[{ required: true, message: 'Please input the destination warehouse!' }]}
          >
            <Input placeholder="e.g., WH2" />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity to Transfer"
            rules={[
              { required: true, message: 'Please input the quantity!' },
              { type: 'number', min: 1, message: 'Quantity must be greater than 0!' },
            ]}
          >
            <InputNumber min={1} placeholder="e.g., 5" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default App;
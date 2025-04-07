import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { message } from 'antd';
import Login from './components/Login';
import AppLayout from './components/AppLayout';
import ContentView from './components/ContentView';
import WarehouseModal from './components/WarehouseModal';
import TransferModal from './components/TransferModal';
import ItemsModal from './components/ItemsModal';
import ItemDetailsModal from './components/ItemDetailsModal';
import Forecasting from './components/Forecasting';
import ForgotPassword from './components/ForgotPassword';
import { useAuth } from './hooks/useAuth';
import { useItems } from './hooks/useItems';
import { useWarehouses } from './hooks/useWarehouses';
import { useWarehouseItems } from './hooks/useWarehouseItems';
import { useCharts } from './hooks/useCharts';
import { useMutations } from './hooks/useMutations';
import { useModals } from './hooks/useModals';
import { itemsPerPage, apiUrl } from './constants/config';
import { itemColumns } from './constants/columns';
import './App.css';
import axios from 'axios';

function App() {
  const [view, setView] = useState('table');
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);

  // Authentication
  const { isAuthenticated, userRole, handleLogin, handleLogout } = useAuth();

  // Hooks must be called unconditionally
  const modals = useModals();
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

  const {
    warehousesData,
    warehousesLoading,
    warehouseQuantities,
    warehouseQuantitiesError,
    warehouseQuantitiesLoading,
  } = useWarehouses(isAuthenticated, view, apiUrl);

  const { warehouseItems, warehouseItemsLoading, warehouseItemsError } = useWarehouseItems(
    isAuthenticated,
    modals.selectedWarehouse,
    modals.isItemsModalVisible,
    apiUrl
  );

  const { barData, barLoading, barError, pieData, pieLoading, pieError } = useCharts(isAuthenticated, view, apiUrl);

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
    if (!isAuthenticated) return;

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
  }, [isAuthenticated]);

  // Log Mutations
  useEffect(() => {
    if (!isAuthenticated) return;

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
  }, [isAuthenticated, addMutation, updateMutation, deleteMutation, logMutation]);

  const handleAdd = useCallback((values) => addMutation.mutate(values), [addMutation]);
  const handleUpdate = useCallback((id, updatedItem) => updateMutation.mutate({ id, updatedItem }), [updateMutation]);
  const handleDelete = useCallback((id) => deleteMutation.mutate(id), [deleteMutation]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const canViewCharts = userRole !== 'viewer';

  const items = itemsData?.items || [];
  const totalItems = itemsData?.totalItems || 0;
  const warehouses = warehousesData || [];

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPassword theme="light" />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <AppLayout
        theme={theme}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setView={setView}
        handleLogout={handleLogout}
        userRole={userRole}
        view={view}
        toggleTheme={toggleTheme}
      >
        <ContentView
          view={view}
          theme={theme}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          userRole={userRole}
          itemsData={itemsData}
          items={items}
          totalItems={totalItems}
          currentPage={currentPage}
          localSearchTerm={localSearchTerm}
          filters={filters}
          handleSearchChange={handleSearchChange}
          handleFilterChange={handleFilterChange}
          handlePageChange={handlePageChange}
          handleSort={handleSort}
          handleAdd={handleAdd}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          handleTransfer={modals.handleTransfer}
          handleViewItem={modals.handleViewItem}
          canEdit={canEdit}
          canViewCharts={canViewCharts}
          barData={barData}
          barLoading={barLoading}
          barError={barError}
          pieData={pieData}
          pieLoading={pieLoading}
          pieError={pieError}
          warehouses={warehouses}
          warehousesLoading={warehousesLoading}
          warehouseQuantities={warehouseQuantities}
          warehouseQuantitiesLoading={warehouseQuantitiesLoading}
          warehouseQuantitiesError={warehouseQuantitiesError}
          showWarehouseModal={modals.showWarehouseModal}
          deleteWarehouseMutation={deleteWarehouseMutation}
          handleViewItems={modals.handleViewItems}
          apiUrl={apiUrl}
          ForecastingComponent={Forecasting}
        />
        <WarehouseModal
          isVisible={modals.isWarehouseModalVisible}
          onOk={() => modals.handleWarehouseOk(warehouseMutation)}
          onCancel={modals.handleWarehouseCancel}
          warehouseForm={modals.warehouseForm}
          title={modals.warehouseModalTitle}
        />
        <TransferModal
          isVisible={modals.isTransferModalVisible}
          onOk={() => modals.handleTransferOk(transferMutation)}
          onCancel={modals.handleTransferCancel}
          transferForm={modals.transferForm}
          items={items}
          selectedItemId={modals.selectedItemId}
          warehouses={warehouses}
          isAuthenticated={isAuthenticated}
        />
        <ItemsModal
          isVisible={modals.isItemsModalVisible}
          onCancel={modals.handleItemsModalCancel}
          selectedWarehouse={modals.selectedWarehouse}
          warehouseItems={warehouseItems}
          warehouseItemsLoading={warehouseItemsLoading}
          warehouseItemsError={warehouseItemsError}
          itemColumns={itemColumns}
          canEdit={canEdit}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          handleTransfer={modals.handleTransfer}
        />
        <ItemDetailsModal
          isVisible={modals.isItemDetailsModalVisible}
          onCancel={modals.handleItemDetailsModalCancel}
          selectedItem={modals.selectedItem}
          warehouses={warehouses}
        />
      </AppLayout>
    </Router>
  );
}

export default App;
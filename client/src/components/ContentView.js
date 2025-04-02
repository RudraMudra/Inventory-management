import React from 'react';
import { Input, Button, Pagination, message, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons'; // Added ClearOutlined for the clear button
import ItemForm from './ItemForm';
import ItemTable from './ItemTable';
import ItemChart from './ItemChart';
import Dashboard from './Dashboard';
import ViewerForecasting from './viewForecasting';
import { themeStyles } from '../constants/themeStyles';
import { itemsPerPage } from '../constants/config';
import { handleExportCSV } from '../utils/exportCSV';
import { warehouseColumns } from '../constants/columns';
import Analytics from './Analytics';

const ContentView = ({
  view,
  theme,
  isAuthenticated,
  isLoading,
  userRole,
  itemsData,
  items,
  totalItems,
  currentPage,
  localSearchTerm,
  filters,
  handleSearchChange,
  handleFilterChange,
  handlePageChange,
  handleSort,
  handleAdd,
  handleUpdate,
  handleDelete,
  handleTransfer,
  handleViewItem,
  canEdit,
  canViewCharts,
  barData,
  barLoading,
  barError,
  pieData,
  pieLoading,
  pieError,
  warehouses,
  warehousesLoading,
  warehouseQuantities,
  warehouseQuantitiesLoading,
  warehouseQuantitiesError,
  showWarehouseModal,
  deleteWarehouseMutation,
  handleViewItems,
  apiUrl,
  ForecastingComponent,
}) => {
  const warehousesWithQuantities = warehouses.map(warehouse => {
    const quantityData = warehouseQuantities.find(q => q.warehouse.toLowerCase() === warehouse.name.toLowerCase()) || { totalQuantity: 0 };
    return {
      ...warehouse,
      totalQuantity: quantityData.totalQuantity || 0,
    };
  });

  const computedWarehouseColumns = warehouseColumns({
    userRole,
    showWarehouseModal,
    deleteWarehouseMutation,
    handleViewItems,
    themeStyles,
    theme,
  });

  // Function to clear search and filters
  const handleClearFilters = () => {
    handleSearchChange({ target: { value: '' } }); // Clear search term
    handleFilterChange({ target: { name: 'minQuantity', value: '' } }); // Clear min quantity
    handleFilterChange({ target: { name: 'maxQuantity', value: '' } }); // Clear max quantity
  };

  return (
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
      {isAuthenticated && !isLoading && view === 'dashboard' && (
        <Dashboard
          itemsData={itemsData}
          userRole={userRole}
          handleExportCSV={() => handleExportCSV(apiUrl)}
          theme={theme}
          apiUrl={apiUrl}
          isAuthenticated={isAuthenticated}
        />
      )}
      {view === 'table' && (
        <>
          {canEdit && (
            <ItemForm
              onSubmit={handleAdd}
              style={{ marginBottom: '32px', display: window.innerWidth < 768 ? 'block' : 'flex', gap: '16px' }}
            />
          )}
          <div
            style={{
              marginBottom: '24px',
              background: themeStyles[theme].card,
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <Space wrap>
              <Input
                placeholder="Search by name, warehouse, or 'low stock'"
                prefix={<SearchOutlined />}
                value={localSearchTerm}
                onChange={handleSearchChange}
                className={theme === 'dark' ? 'ant-input-dark' : ''}
                style={{
                  width: '300px',
                  borderRadius: '6px',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  background: themeStyles[theme].input,
                  color: themeStyles[theme].text,
                  fontSize: '14px',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1890ff')}
                onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
              />
              <Input
                name="minQuantity"
                placeholder="Min Quantity"
                value={filters.minQuantity}
                onChange={handleFilterChange}
                type="number"
                disabled={!canEdit}
                style={{
                  width: '150px',
                  borderRadius: '6px',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  background: themeStyles[theme].input,
                  color: themeStyles[theme].text,
                  fontSize: '14px',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1890ff')}
                onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
              />
              <Input
                name="maxQuantity"
                placeholder="Max Quantity"
                value={filters.maxQuantity}
                onChange={handleFilterChange}
                type="number"
                disabled={!canEdit}
                style={{
                  width: '150px',
                  borderRadius: '6px',
                  padding: '8px',
                  border: '1px solid #d9d9d9',
                  background: themeStyles[theme].input,
                  color: themeStyles[theme].text,
                  fontSize: '14px',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#1890ff')}
                onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
              />
              <Button
                onClick={handleClearFilters}
                icon={<ClearOutlined />}
                style={{
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '14px',
                  height: '40px',
                  borderColor: '#d9d9d9',
                  color: '#595959',
                  background: themeStyles[theme].button,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = theme === 'dark' ? '#444' : '#f5f5f5')}
                onMouseLeave={(e) => (e.currentTarget.style.background = themeStyles[theme].button)}
              >
                Clear Filters
              </Button>
            </Space>
          </div>
          <ItemTable
            items={items}
            onUpdate={canEdit ? handleUpdate : () => message.error('Access denied')}
            onDelete={canEdit ? handleDelete : () => message.error('Access denied')}
            onSort={handleSort}
            onTransfer={canEdit ? handleTransfer : () => message.error('Access denied')}
            onView={handleViewItem}
            canEdit={canEdit}
            warehouses={warehouses}
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
                columns={computedWarehouseColumns}
                onUpdate={userRole === 'admin' ? (id, updatedItem) => showWarehouseModal(updatedItem) : () => message.error('Access denied')}
                onDelete={userRole === 'admin' ? (id) => deleteWarehouseMutation.mutate(id) : () => message.error('Access denied')}
                canEdit={userRole === 'admin'}
                showTransfer={false}
              />
            </>
          )}
        </>
      )}
      {view === 'forecasting' && canViewCharts && ForecastingComponent && (
        <ForecastingComponent
          theme={theme}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          apiUrl={apiUrl}
        />
      )}
      {view === 'viewerForecasting' && userRole === 'viewer' && (
        <ViewerForecasting
          theme={theme}
          isAuthenticated={isAuthenticated}
          apiUrl={apiUrl}
        />
      )}
      {view === 'analytics' && canViewCharts && (
        <Analytics
          theme={theme}
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          apiUrl={apiUrl}
        />
      )}
      {!canViewCharts && (view === 'bar' || view === 'pie' || view === 'forecasting') && (
        <div style={{ textAlign: 'center', color: themeStyles[theme].text }}>Access denied to charts and forecasting</div>
      )}
    </div>
  );
};

export default ContentView;
import { useState } from 'react';
import { message, Modal, Spin } from 'antd';
import ItemTable from './ItemTable';

const ItemsModal = ({ isVisible, onCancel, selectedWarehouse, warehouseItems, warehouseItemsLoading, warehouseItemsError, itemColumns, canEdit, handleUpdate, handleDelete, handleTransfer }) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (sorter) => {
    if (sorter.order) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    } else {
      setSortBy('name');
      setSortOrder('asc');
    }
  };

  //sort the items based on sortby and sortorder
  const sortedItems = [...warehouseItems].sort((a, b) => {
    const order = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      return order * a.name.localeCompare(b.name);
    } else if (sortBy === 'quantity') {
      return order * (a.quantity - b.quantity);
    } else if (sortBy === 'status') {
      const aIsLowStock = a.quantity <= a.lowStockThreshold ? -1 : 1;
      const bIsLowStock = b.quantity <= b.lowStockThreshold ? -1 : 1;
      return order * (aIsLowStock - bIsLowStock);
    }
    return 0;
  });

  return (
    <Modal
      title={`Items in ${selectedWarehouse}`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {warehouseItemsLoading && (
        <Spin size="large" tip="Loading items..." style={{ display: 'block', textAlign: 'center', margin: '20px 0' }} />
      )}
      {warehouseItemsError && (
        <div style={{ textAlign: 'center', color: 'red', margin: '20px 0' }}>
          Error loading items: {warehouseItemsError.message}
        </div>
      )}
      {!warehouseItemsLoading && !warehouseItemsError && (
        <>
          {warehouseItems.length === 0 ? (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              No items found in this warehouse.
            </div>
          ) : (
            <ItemTable
              items={sortedItems}
              columns={itemColumns}
              onUpdate={canEdit ? handleUpdate : () => message.error('Access denied')}
              onDelete={canEdit ? handleDelete : () => message.error('Access denied')}
              onTransfer={canEdit ? handleTransfer : () => message.error('Access denied')}
              onSort={handleSort}
              canEdit={canEdit}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ItemsModal;
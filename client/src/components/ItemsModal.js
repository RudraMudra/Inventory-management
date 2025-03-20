import React from 'react';
import { message, Modal, Spin } from 'antd';
import ItemTable from './ItemTable';

const ItemsModal = ({ isVisible, onCancel, selectedWarehouse, warehouseItems, warehouseItemsLoading, warehouseItemsError, itemColumns, canEdit, handleUpdate, handleDelete, handleTransfer }) => {
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
              items={warehouseItems}
              columns={itemColumns}
              onUpdate={canEdit ? handleUpdate : () => message.error('Access denied')}
              onDelete={canEdit ? handleDelete : () => message.error('Access denied')}
              onTransfer={canEdit ? handleTransfer : () => message.error('Access denied')}
              canEdit={canEdit}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ItemsModal;
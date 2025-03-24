import React from 'react';
import { Modal, Descriptions } from 'antd';

const ItemDetailsModal = ({ isVisible, onCancel, selectedItem, warehouses }) => {

    const warehouse = selectedItem?.warehouse && selectedItem.warehouse !== 'Not Assigned'
        ? warehouses.find(w => w.name === selectedItem.warehouse)
        : null;
    const warehouseLocation = warehouse ? warehouse.location : 'Not Available';

    return (
        <Modal
            title="Item Details"
            open={isVisible}
            onCancel={onCancel}
            footer={null}
        >
            {selectedItem && (
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Name">{selectedItem.name}</Descriptions.Item>
                    <Descriptions.Item label="Quantity">{selectedItem.quantity}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <span style={{
                            color: selectedItem.quantity <= selectedItem.lowStockThreshold ? 'red' : 'green',
                            border: `1px solid ${selectedItem.quantity <= selectedItem.lowStockThreshold ? 'red' : 'green'}`,
                            padding: '2px 4px',
                            borderRadius: '4px'
                        }}>
                            {selectedItem.status}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Low Stock Threshold">{selectedItem.lowStockThreshold}</Descriptions.Item>
                    <Descriptions.Item label="Warehouse">
                        {selectedItem.warehouse || 'Not Assigned'}
                        {warehouseLocation !== 'Not Available' && ` (${warehouseLocation})`}
                    </Descriptions.Item>
                </Descriptions>
            )}
        </Modal>
    );
};

export default ItemDetailsModal;
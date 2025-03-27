// client/src/components/TransferModal.js
import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select; // Alias for Select.Option

const TransferModal = ({ isVisible, onOk, onCancel, transferForm, items, selectedItemId, warehouses }) => {
  useEffect(() => {
    if (selectedItemId) {
      const selectedItem = items.find(item => item._id === selectedItemId);
      if (selectedItem) {
        // console.log("Setting Source Warehouse:", selectedItem.warehouse); // Debugging
        transferForm.setFieldsValue({
          fromWarehouse: selectedItem.warehouse, // Setting warehouse value
        });
      }
    }
  }, [selectedItemId, items, transferForm]);

  // Log warehouses to debug the data structure

  return (
    <Modal title="Transfer Item" open={isVisible} onOk={onOk} onCancel={onCancel}>
      <Form form={transferForm} layout="vertical">
        <Form.Item name="fromWarehouse" label="Source Warehouse">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="toWarehouse"
          label="Destination Warehouse"
          rules={[{ required: true, message: 'Please select the destination warehouse!' }]}
        >
          <Select placeholder="Select a warehouse">
            {warehouses.map(warehouse => (
              <Option key={warehouse._id || warehouse.name} value={warehouse.name}>
                {warehouse.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity to Transfer"
          rules={[
            { required: true, message: 'Please input the quantity!' },
            { type: 'number', min: 1, message: 'Quantity must be greater than 0!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const item = items.find(i => i._id === selectedItemId);
                if (!item || !value) return Promise.resolve();
                if (value > item.quantity) {
                  return Promise.reject(new Error(`Cannot transfer more than available quantity (${item.quantity})!`));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <InputNumber min={1} placeholder="e.g., 5" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
      
    </Modal>
  );
};

export default TransferModal;
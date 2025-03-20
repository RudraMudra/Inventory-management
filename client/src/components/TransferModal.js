import React from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const TransferModal = ({ isVisible, onOk, onCancel, transferForm, items, selectedItemId, warehouses }) => {
  return (
    <Modal
      title="Transfer Item"
      open={isVisible}
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form form={transferForm} layout="vertical">
        <Form.Item
          name="fromWarehouse"
          label="Source Warehouse"
          rules={[{ required: true, message: 'Please input the source warehouse!' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="toWarehouse"
          label="Destination Warehouse"
          rules={[{ required: true, message: 'Please select the destination warehouse!' }]}
        >
          <Select placeholder="Select a warehouse">
            {warehouses.map(warehouse => (
              <Select.Option key={warehouse._id} value={warehouse.name}>
                {warehouse.name}
              </Select.Option>
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
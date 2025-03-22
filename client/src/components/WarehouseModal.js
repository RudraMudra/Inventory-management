import React from 'react';
import { Modal, Form, Input } from 'antd';

const WarehouseModal = ({ isVisible, onOk, onCancel, warehouseForm, title }) => {
  return (
    <Modal
      title={title} // Use the title prop passed from App.js
      open={isVisible}
      onOk={onOk}
      onCancel={onCancel}
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
  );
};

export default WarehouseModal;
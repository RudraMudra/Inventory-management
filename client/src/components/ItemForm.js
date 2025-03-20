import React from 'react';
import { Form, Input, Button, InputNumber } from 'antd';

const ItemForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <Form form={form} onFinish={handleFinish} layout="inline" style={{ marginBottom: 20 }}>
      <Form.Item name="name" rules={[{ required: true, message: 'Name required' }]}>
        <Input placeholder="Item Name" />
      </Form.Item>
      <Form.Item name="quantity" rules={[{ required: true, message: 'Quantity required' }]}>
        <InputNumber min={0} placeholder="Quantity" />
      </Form.Item>
      <Form.Item name="warehouse" rules={[{ required: true, message: 'Warehouse required' }]}>
        <Input placeholder="Warehouse (e.g., WH1)" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Add Item</Button>
      </Form.Item>
    </Form>
  );
};

export default ItemForm;
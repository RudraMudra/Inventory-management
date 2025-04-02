import React from 'react';
import { Form, Input, Button, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ItemForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };

  return (
    <div
      style={{
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical" // Changed to vertical for better spacing and readability
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'flex-end',
        }}
      >
        <Form.Item
          name="name"
          label="Item Name"
          rules={[{ required: true, message: 'Please enter the item name' }]}
          style={{ flex: '1 1 200px' }}
        >
          <Input
            placeholder="Enter item name (e.g., Bluetooth Tracker)"
            style={{
              borderRadius: '6px',
              padding: '8px',
              border: '1px solid #d9d9d9',
              fontSize: '14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#1890ff')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: 'Please enter the quantity' }]}
          style={{ flex: '1 1 150px' }}
        >
          <InputNumber
            min={0}
            placeholder="Enter quantity"
            style={{
              width: '100%',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#1890ff')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
        </Form.Item>

        <Form.Item
          name="warehouse"
          label="Warehouse"
          rules={[{ required: true, message: 'Please enter the warehouse' }]}
          style={{ flex: '1 1 150px' }}
        >
          <Input
            placeholder="Enter warehouse (e.g., WH1)"
            style={{
              borderRadius: '6px',
              padding: '8px',
              border: '1px solid #d9d9d9',
              fontSize: '14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#1890ff')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
        </Form.Item>

        <Form.Item
          name="lowStockThreshold"
          label="Low Stock Threshold"
          rules={[{ required: true, message: 'Please enter the low stock threshold' }]}
          style={{ flex: '1 1 150px' }}
        >
          <InputNumber
            min={0}
            placeholder="Enter threshold (e.g., 10)"
            style={{
              width: '100%',
              borderRadius: '6px',
              fontSize: '14px',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#1890ff')}
            onBlur={(e) => (e.target.style.borderColor = '#d9d9d9')}
          />
        </Form.Item>

        <Form.Item style={{ flex: '0 0 auto', marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            style={{
              background: '#1890ff',
              borderColor: '#1890ff',
              borderRadius: '6px',
              padding: '9px 18px',
              fontSize: '14px',
              marginBottom: '22px',
              transition: 'all 0.3s',
              height: '40px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#096dd9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
          >
            Add Item
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ItemForm;
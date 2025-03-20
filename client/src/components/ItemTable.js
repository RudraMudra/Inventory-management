import React from 'react';
import { Table, Button, Tag } from 'antd';
import { DeleteOutlined, MinusOutlined, SwapOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const ItemTable = ({ items, onUpdate, onDelete, onSort, onTransfer, canEdit, columns, showTransfer = true }) => {
  // Compute status for each item (only for items, not warehouses)
  const itemsWithStatus = items.map(item => {
    if (item.quantity !== undefined && item.lowStockThreshold !== undefined) {
      return {
        ...item,
        status: item.quantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock',
      };
    }
    return item;
  });

  const defaultColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name), width: '30%' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', sorter: (a, b) => a.quantity - b.quantity, width: '15%' },
    { title: 'Warehouse', dataIndex: 'warehouse', key: 'warehouse', sorter: (a, b) => a.warehouse.localeCompare(b.warehouse), width: '15%' },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        record.quantity !== undefined && record.lowStockThreshold !== undefined ? (
          <Tag color={record.quantity <= record.lowStockThreshold ? 'red' : '#b7eb8f'} style={{ borderRadius: '4px' }}>
            {record.quantity <= record.lowStockThreshold ? 'Low Stock' : 'In Stock'}
          </Tag>
        ) : null
      ),
      sorter: (a, b) => {
        if (a.quantity === undefined || b.quantity === undefined) return 0;
        const statusA = a.quantity <= a.lowStockThreshold ? 'Low Stock' : 'In Stock';
        const statusB = b.quantity <= b.lowStockThreshold ? 'Low Stock' : 'In Stock';
        return statusA.localeCompare(statusB);
      },
      width: '15%',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {record.quantity !== undefined && canEdit && (
            <Button
              icon={<MinusOutlined />}
              onClick={() => onUpdate(record._id, { ...record, quantity: record.quantity - 1 })}
              style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
              size="small"
            >
              Reduce
            </Button>
          )}
          {canEdit && (
            <>
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => onDelete(record._id)}
                size="small"
              >
                Delete
              </Button>
              {showTransfer && (
                <Button
                  icon={<SwapOutlined />}
                  onClick={() => onTransfer(record._id)}
                  style={{ background: '#1890ff', borderColor: '#1890ff', color: '#fff' }}
                  size="small"
                  disabled={!canEdit}
                >
                  Transfer
                </Button>
              )}
            </>
          )}
        </div>
      ),
      width: '30%',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Table
        dataSource={itemsWithStatus}
        columns={columns || defaultColumns}
        rowKey="_id"
        pagination={false}
        bordered
        size="middle"
        rowClassName={(record, index) => index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}
        components={{
          body: {
            row: ({ className, ...props }) => (
              <motion.tr
                className={className}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: props['data-row-key'] * 0.05 }}
                {...props}
              />
            ),
          },
        }}
        onChange={(_, __, sorter) => onSort && onSort(sorter)}
      />
    </motion.div>
  );
};

export default ItemTable;
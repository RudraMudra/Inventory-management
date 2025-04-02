import { useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { DeleteOutlined, MinusOutlined, SwapOutlined, EyeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const ItemTable = ({ items, onUpdate, onDelete, onSort, onTransfer, onView, canEdit, columns, showTransfer = true }) => {
  // State for search and pagination
  const [searchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of items per page

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

  // Filter items based on search text
  const filteredItems = itemsWithStatus.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.warehouse.toLowerCase().includes(searchText.toLowerCase())
  );

  // Paginate filtered items
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const defaultColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      width: '30%',
      render: (text) => (
        <span style={{ fontWeight: 500, color: '#1d39c4' }}>{text}</span>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: (a, b) => a.quantity - b.quantity,
      width: '15%',
      render: (text) => (
        <span style={{ color: text <= 10 ? '#f5222d' : '#595959' }}>{text}</span>
      ),
    },
    {
      title: 'Warehouse',
      dataIndex: 'warehouse',
      key: 'warehouse',
      sorter: (a, b) => a.warehouse.localeCompare(b.warehouse),
      width: '15%',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        record.quantity !== undefined && record.lowStockThreshold !== undefined ? (
          <Tag
            color={record.quantity <= record.lowStockThreshold ? '#fff1f0' : '#e6fffb'}
            style={{
              borderRadius: '12px',
              padding: '4px 8px',
              fontWeight: 500,
              color: record.quantity <= record.lowStockThreshold ? '#f5222d' : '#13c2c2',
              border: 'none',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
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
        <Space size="small">
          {canEdit ? (
            <>
              {record.quantity !== undefined && (
                <Button
                  icon={<MinusOutlined />}
                  onClick={() => onUpdate(record._id, { ...record, quantity: record.quantity - 1 })}
                  style={{
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#389e0d')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#52c41a')}
                  size="small"
                >
                  Reduce
                </Button>
              )}
              <Button
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record._id)}
                style={{
                  background: '#ff4d4f',
                  borderColor: '#ff4d4f',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#cf1322')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ff4d4f')}
                size="small"
              >
                Delete
              </Button>
              {showTransfer && (
                <Button
                  icon={<SwapOutlined />}
                  onClick={() => onTransfer(record._id)}
                  style={{
                    background: '#1890ff',
                    borderColor: '#1890ff',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '4px 12px',
                    fontSize: '14px',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#096dd9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
                  size="small"
                >
                  Transfer
                </Button>
              )}
            </>
          ) : (
            <Button
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              style={{
                background: '#faad14',
                borderColor: '#faad14',
                color: '#fff',
                borderRadius: '6px',
                padding: '4px 12px',
                fontSize: '14px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#d48806')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#faad14')}
              size="small"
            >
              View
            </Button>
          )}
        </Space>
      ),
      width: '30%',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
    >
      
      {/* Table */}
      <Table
        dataSource={paginatedItems}
        columns={columns || defaultColumns}
        rowKey="_id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredItems.length,
          onChange: (page) => setCurrentPage(page),
          showSizeChanger: false,
          style: { marginTop: '20px', textAlign: 'center' },
        }}
        bordered
        size="middle"
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-even' : 'table-row-odd')}
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
        style={{
          background: '#fff',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        scroll={{ x: 'max-content' }} // Ensure table is scrollable on smaller screens
        locale={{
          emptyText: (
            <div style={{ padding: '20px', color: '#888' }}>
              No items found. Add an item to get started!
            </div>
          ),
        }}
      />
    </motion.div>
  );
};

export default ItemTable;
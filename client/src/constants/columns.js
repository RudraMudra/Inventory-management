import { Button, Space, Modal } from 'antd';

const confirmDelete = (record, deleteWarehouseMutation) => {
  Modal.confirm({
    title: 'Are you sure you want to delete this warehouse?',
    content: `This will delete the warehouse "${record.name}".`,
    onOk: () => deleteWarehouseMutation.mutate(record._id),
    okText: 'Yes',
    cancelText: 'No',
  });
};

export const warehouseColumns = ({ userRole, showWarehouseModal, deleteWarehouseMutation, handleViewItems, themeStyles, theme }) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: '25%',
    render: (text) => (
      <button
        onClick={() => handleViewItems(text)}
        style={{
          color: themeStyles[theme].text,
          background: 'none',
          border: 'none',
          padding: 0,
          font: 'inherit',
          cursor: 'pointer',
        }}
        type="button"
        aria-label={`View items in ${text}`}
      >
        {text}
      </button>
    ),
  },
  { title: 'Location', dataIndex: 'location', key: 'location', width: '25%' },
  {
    title: 'Total Quantity',
    dataIndex: 'totalQuantity',
    key: 'totalQuantity',
    sorter: (a, b) => a.totalQuantity - b.totalQuantity,
    width: '20%',
  },
  { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', render: (text) => new Date(text).toLocaleString(), width: '20%' },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space size="middle">
        {userRole === 'admin' && (
          <>
            <Button onClick={() => showWarehouseModal(record)}>Edit</Button>
            <Button
              danger
              onClick={() => confirmDelete(record, deleteWarehouseMutation)}
            >
              Delete
            </Button>
          </>
        )}
      </Space>
    ),
    width: '30%',
  },
];

export const itemColumns = [
  { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', sorter: (a, b) => a.quantity - b.quantity },
  { title: 'Low Stock Threshold', dataIndex: 'lowStockThreshold', key: 'lowStockThreshold' },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, record) => {
      const isLowStock = record.quantity <= record.lowStockThreshold;
      return (
        <span style={{ color: isLowStock ? 'red' : 'green' }}>
          {isLowStock ? 'Low Stock' : 'In Stock'}
        </span>
      );
    },
    sorter: (a, b) => (a.quantity <= a.lowStockThreshold ? -1 : 1) - (b.quantity <= b.lowStockThreshold ? -1 : 1),
  },
];
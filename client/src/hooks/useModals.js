import { useState, useCallback } from 'react';
import { Form, message } from 'antd';

export const useModals = () => {
  const [isWarehouseModalVisible, setIsWarehouseModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
  const [isItemDetailsModalVisible, setIsItemDetailsModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [warehouseModalTitle, setWarehouseModalTitle] = useState('Add Warehouse');
  const [warehouseForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  const handleTransfer = useCallback((itemId) => {
    setSelectedItemId(itemId);
    setIsTransferModalVisible(true);
  }, []);

  const handleTransferOk = (transferMutation) => {
    transferForm.validateFields().then((values) => {
      console.log('Form values:', values);
      const { fromWarehouse, toWarehouse, quantity } = values;

      // Explicitly validate all required fields
      if (!fromWarehouse || !toWarehouse || quantity == null) {
        message.error('Please fill in all required fields: Source Warehouse, Destination Warehouse, and Quantity');
        return;
      }

      if (quantity <= 0) {
        message.error('Quantity must be greater than 0');
        return;
      }

      const payload = {
        itemId: selectedItemId,
        fromWarehouse,
        toWarehouse,
        quantity: Number(quantity),
      };

      if (!selectedItemId) {
        message.error('No item selected for transfer');
        return;
      }

      transferMutation.mutate(payload, {
        onSuccess: () => {
          message.success('Transfer completed successfully');
          setIsTransferModalVisible(false);
          transferForm.resetFields();
        },
        onError: (error) => {
          console.error('Transfer mutation error:', error.response?.data);
          message.error(error.response?.data?.message || 'Failed to transfer item');
        },
      });
    }).catch((errorInfo) => {
      console.log('Validation failed:', errorInfo);
      message.error('Please fill in all required fields correctly');
    });
  };

  const handleTransferCancel = () => {
    setIsTransferModalVisible(false);
    transferForm.resetFields();
  };

  const handleViewItems = (warehouseName) => {
    setSelectedWarehouse(warehouseName);
    setIsItemsModalVisible(true);
  };

  const handleItemsModalCancel = () => {
    setIsItemsModalVisible(false);
    setSelectedWarehouse(null);
  };

  const handleViewItem = useCallback((item) => {
    setSelectedItem(item);
    setIsItemDetailsModalVisible(true);
  }, []);

  const handleItemDetailsModalCancel = () => {
    setIsItemDetailsModalVisible(false);
    setSelectedItem(null);
  };

  const showWarehouseModal = (record = null) => {
    if (record) {
      warehouseForm.setFieldsValue(record);
      setWarehouseModalTitle('Edit Warehouse');
    } else {
      warehouseForm.resetFields();
      setWarehouseModalTitle('Add Warehouse');
    }
    setIsWarehouseModalVisible(true);
  };

  const handleWarehouseOk = (warehouseMutation) => {
    warehouseForm.validateFields().then((values) => {
      warehouseMutation.mutate(values);
      setIsWarehouseModalVisible(false);
      warehouseForm.resetFields();
    });
  };

  const handleWarehouseCancel = () => {
    setIsWarehouseModalVisible(false);
    warehouseForm.resetFields();
  };

  return {
    isWarehouseModalVisible,
    isTransferModalVisible,
    isItemsModalVisible,
    isItemDetailsModalVisible,
    selectedItemId,
    selectedWarehouse,
    selectedItem,
    warehouseModalTitle,
    warehouseForm,
    transferForm,
    handleTransfer,
    handleTransferOk,
    handleTransferCancel,
    handleViewItems,
    handleItemsModalCancel,
    handleViewItem,
    handleItemDetailsModalCancel,
    showWarehouseModal,
    handleWarehouseOk,
    handleWarehouseCancel,
  };
};
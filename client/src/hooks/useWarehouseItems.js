import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';

export const useWarehouseItems = (isAuthenticated, selectedWarehouse, isItemsModalVisible, apiUrl) => {
  const { data: warehouseItems = [], isLoading: warehouseItemsLoading, error: warehouseItemsError } = useQuery({
    queryKey: ['warehouseItems', selectedWarehouse],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/by-warehouse/${selectedWarehouse}`);
      return res.data;
    },
    enabled: isAuthenticated && !!selectedWarehouse && isItemsModalVisible,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (err) => {
      console.error('Error fetching items for warehouse:', err);
      message.error(`Failed to fetch items for warehouse: ${err.response?.data?.message || err.message}`);
    },
  });

  return { warehouseItems, warehouseItemsLoading, warehouseItemsError };
};
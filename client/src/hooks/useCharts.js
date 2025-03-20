import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useCharts = (isAuthenticated, view, apiUrl) => {
  const { data: barData, isLoading: barLoading, error: barError } = useQuery({
    queryKey: ['barChart'],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/items/bar-chart`);
      return res.data;
    },
    enabled: isAuthenticated && view === 'bar',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const { data: pieData, isLoading: pieLoading, error: pieError } = useQuery({
    queryKey: ['pieChart'],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}/items/pie-chart`);
      return res.data;
    },
    enabled: isAuthenticated && view === 'pie',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  return { barData, barLoading, barError, pieData, pieLoading, pieError };
};
import axios from 'axios';
import { message } from 'antd';

export const handleExportCSV = async (apiUrl) => {
  try {
    const response = await axios.get(`${apiUrl}/items/export`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    message.success('CSV exported successfully');
  } catch (err) {
    message.error(`Failed to export CSV: ${err.response?.data?.message || err.message}`);
    console.error('Export error:', err);
  }
};
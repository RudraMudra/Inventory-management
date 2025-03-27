import { BarChartOutlined, PieChartOutlined, HomeOutlined, SlidersOutlined, DatabaseOutlined } from '@ant-design/icons';

export const menuItems = [
  { key: '1', icon: <DatabaseOutlined />, label: 'Inventory' },
  { key: '2', icon: <BarChartOutlined />, label: 'Bar Chart' },
  { key: '3', icon: <PieChartOutlined />, label: 'Pie Chart' },
  { key: '4', icon: <HomeOutlined />, label: 'Warehouses' },
  { key: '5', icon: <SlidersOutlined />, label: 'Forecasting' },
];

export const handleMenuClick = (e, setView, toggleTheme, handleLogout) => {
  switch (e.key) {
    case '1': setView('table'); break;
    case '2': setView('bar'); break;
    case '3': setView('pie'); break;
    case '4': setView('warehouses'); break;
    case '5': setView('forecasting'); break;
    case '6': handleLogout(); break;
    default: break;
  }
};
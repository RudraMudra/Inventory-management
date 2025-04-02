// client/src/components/AppLayout.js
import React from 'react';
import { Layout, Typography, Button, Menu, Avatar, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DownOutlined,
  AreaChartOutlined,
} from '@ant-design/icons';
import { IoIosAnalytics, IoIosLogOut } from "react-icons/io";
import { MdDashboard, MdInventory  } from "react-icons/md";
import { FaChartBar, FaWarehouse, FaChartPie   } from "react-icons/fa";
import { FcAreaChart } from "react-icons/fc";
import { SiShutterstock } from "react-icons/si";
import { themeStyles } from '../constants/themeStyles';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

// Define menu items directly in AppLayout.js
const menuItems = [
  { key: 'dashboard', icon: <MdDashboard/>, label: 'Dashboard' },
  { key: 'table', icon: <MdInventory />, label: 'Inventory Items' },
  { key: 'bar', icon: <FaChartBar />, label: 'Quantity' },
  { key: 'pie', icon: <FaChartPie />, label: 'Stock Status' },
  { key: 'warehouses', icon: <FaWarehouse />, label: 'Warehouses' },
  { key: 'analytics', icon: <IoIosAnalytics />, label: 'Analytics' },
  { key: 'forecasting', icon: <FcAreaChart />, label: 'Forecasting' },
  { key: 'viewerForecasting', icon: <AreaChartOutlined />, label: 'Viewer Forecasting' }, // New tab for viewers
];


// Handle menu click events
const handleMenuClick = (e, setView, toggleTheme, handleLogout) => {
  if (e.key === 'theme') {
    toggleTheme();
  } else if (e.key === 'logout') {
    handleLogout();
  } else {
    setView(e.key);
  }
};

const AppLayout = ({
  children,
  theme,
  collapsed,
  setCollapsed,
  setView,
  handleLogout,
  userRole,
  view,
  toggleTheme,
}) => {
  const toggleCollapse = () => setCollapsed(!collapsed);

  const displayRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User';

  const profileMenu = {
    items: [
      {
        key: 'logout',
        label: 'Logout',
        icon: <IoIosLogOut />,
        onClick: handleLogout,
      },
    ],
  };

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.key === 'bar' || item.key === 'pie' || item.key === 'forecasting' || item.key === 'line' || item.key === 'analytics') {
      return userRole !== 'viewer'; // Hide charts and forecasting from viewers
    }
    if (item.key === 'viewerForecasting') {
      return userRole === 'viewer'; // Show Viewer Forecasting only to viewers
    }
    return true; // Show other tabs (Dashboard, Items, Warehouses) to all roles
  });

  // Update the header title based on the view
  const getHeaderTitle = () => {
    switch (view) {
      case 'dashboard':
        return 'Dashboard';
      case 'table':
        return userRole === 'viewer' ? 'Inventory Items' : 'Inventory Management';
      case 'bar':
        return 'Quantity by Warehouse';
      case 'pie':
        return 'Stock Status Distribution';
      case 'warehouses':
        return 'Warehouse Management';
      case 'analytics':
        return 'Analytics';
      case 'forecasting':
        return userRole === 'viewer' ? 'Inventory Forecasting (Viewer)' : 'Inventory Forecasting';
      default:
        return 'Inventory Management';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: themeStyles[theme].background }}>
      <Sider
        width={200}
        collapsed={collapsed || window.innerWidth < 768}
        collapsible
        trigger={null}
        style={{ background: themeStyles[theme].sider }}
      >
        <div style={{ padding: collapsed ? '16px 8px' : '16px', textAlign: 'center' }}>
          <SiShutterstock style={{ color: themeStyles[theme].text, fontSize: '40px' }} />
          {!collapsed && (
            <Title
              level={3}
              style={{ color: themeStyles[theme].text, margin: '8px 0 0', fontSize: '24px' }}
            >
              StockFlow
            </Title>
          )}
        </div>
        <Menu
          theme={theme === 'light' ? 'light' : 'dark'}
          mode="inline"
          selectedKeys={[view]}
          onClick={(e) => handleMenuClick(e, setView, toggleTheme, handleLogout)}
          style={{ background: themeStyles[theme].sider }}
          items={filteredMenuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeStyles[theme].header,
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            style={{
              fontSize: '16px',
              color: themeStyles[theme].text,
              display: window.innerWidth >= 768 ? 'block' : 'none',
            }}
          />
          <Title level={2} style={{ color: themeStyles[theme].text, margin: 0, fontSize: '28px' }}>
            {getHeaderTitle()}
          </Title>
          <Dropdown menu={profileMenu} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: theme === 'light' ? '#1890ff' : '#40a9ff' }}
              />
              <Text style={{ color: themeStyles[theme].text, fontSize: '16px' }}>
                {displayRole}
              </Text>
              <DownOutlined style={{ color: themeStyles[theme].text, fontSize: '12px' }} />
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: '24px', minWidth: window.innerWidth < 768 ? '100%' : 'auto' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
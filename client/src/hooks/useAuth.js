import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      delete axios.defaults.headers.common['Authorization'];
      message.error('Please log in to continue');
    }
  }, []);

  const handleLogin = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
    delete axios.defaults.headers.common['Authorization'];
    message.success('Logged out successfully');
  };

  return { isAuthenticated, userRole, handleLogin, handleLogout };
};
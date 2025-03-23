import { useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('userName');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(name);
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
    setUserName(localStorage.getItem('userName'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserRole(null);
    delete axios.defaults.headers.common['Authorization'];
    message.success('Logged out successfully');
  };

  return { isAuthenticated, userRole, userName, handleLogin, handleLogout };
};
import React, { useState } from 'react';
import { Input, Button, message, Card, Row, Col } from 'antd';
import { StockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!username || !oldPassword || !newPassword) {
      message.error('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      message.error('New password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${apiUrl}/auth/reset-password`, {
        username,
        oldPassword,
        newPassword,
      });
      message.success('Password updated successfully. Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      message.error('Failed to update password: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4fc3f7, #ffffff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center' }}>
            <StockOutlined style={{ fontSize: '36px', color: '#096dd9' }} />
            <h2 style={{ margin: '10px 0 0', color: '#000' }}>StockFlow - Reset Password</h2>
          </div>
        }
        bordered={false}
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          background: '#fff',
        }}
      >
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="large"
              style={{ borderRadius: '4px' }}
            />
          </Col>
          <Col span={24}>
            <Input.Password
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              size="large"
              style={{ borderRadius: '4px' }}
            />
          </Col>
          <Col span={24}>
            <Input.Password
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              size="large"
              style={{ borderRadius: '4px' }}
            />
          </Col>
          <Col span={24} style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleResetPassword}
              loading={loading}
              style={{
                width: '100%',
                background: '#1890ff',
                borderColor: '#1890ff',
                borderRadius: '4px',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#096dd9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
            >
              Update Password
            </Button>
          </Col>
          <Col span={24} style={{ textAlign: 'center', color: '#666' }}>
            <a href="/login" style={{ color: '#1890ff' }}>
              Back to Login
            </a>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ForgotPassword;
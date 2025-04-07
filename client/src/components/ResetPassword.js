import React, { useState, useEffect } from 'react';
import { Input, Button, message, Card, Row, Col } from 'antd';
import { StockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = ({ theme }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const navigate = useNavigate();

  useEffect(() => {
    // Validate token exists
    if (!token) {
      message.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleResetPassword = async () => {
    if (!password || password.length < 6) {
      message.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/auth/reset-password/${token}`, { password });
      message.success('Password reset successful. Please log in.');
      navigate('/login');
    } catch (err) {
      message.error('Failed to reset password: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        minHeight: '100vh',
        background: theme === 'dark' ? 'linear-gradient(135deg, #1f1f1f, #2f2f2f)' : 'linear-gradient(135deg, #4fc3f7, #ffffff)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center' }}>
            <StockOutlined style={{ fontSize: '36px', color: theme === 'dark' ? '#1890ff' : '#096dd9' }} />
            <h2 style={{ margin: '10px 0 0', color: theme === 'dark' ? '#fff' : '#000' }}>StockFlow</h2>
          </div>
        }
        bordered={false}
        style={{
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          background: theme === 'dark' ? '#2f2f2f' : '#fff',
        }}
      >
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Input.Password
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              Reset Password
            </Button>
          </Col>
          <Col span={24} style={{ textAlign: 'center', color: theme === 'dark' ? '#ccc' : '#666' }}>
            <a href="/login" style={{ color: theme === 'dark' ? '#40a9ff' : '#1890ff' }}>
              Back to Login
            </a>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ResetPassword;
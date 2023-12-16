import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { UserOutlined, UploadOutlined, FolderOutlined, TagOutlined, LogoutOutlined } from '@ant-design/icons';
import cookie from 'react-cookies';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const MenuComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // clear cookie for logout
    cookie.remove('user');
    cookie.remove('JSESSIONID');
    navigate('/login');
  };

  return (
    <Sider width={170}>
      <div className="logo" />
      <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]}>
        <Menu.Item key="/index" icon={<UserOutlined />}>
          <Link to="/index">{cookie.load('user')}</Link>
        </Menu.Item>
        <Menu.Item key="/upload" icon={<UploadOutlined />}>
          <Link to="/upload">Dataset Upload</Link>
        </Menu.Item>
        <Menu.Item key="/manage" icon={<FolderOutlined />}>
          <Link to="/manage">Dataset Management</Link>
        </Menu.Item>
        <Menu.Item key="/user_manage" icon={<FolderOutlined />}>
          <Link to="/user_manage">User Management</Link>
        </Menu.Item>
      </Menu>
      <Button
        type="primary"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)' }}
      >
        Logout
      </Button>
    </Sider>
  );
};

export default MenuComponent;

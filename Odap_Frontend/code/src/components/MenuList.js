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
    // 执行注销操作，清除cookie等
    // 这里只是示例，实际操作根据你的需求来实现
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
          <Link to="/upload">上传数据集</Link>
        </Menu.Item>
        <Menu.Item key="/manage" icon={<FolderOutlined />}>
          <Link to="/manage">管理数据集</Link>
        </Menu.Item>
        <Menu.Item key="/user_manage" icon={<FolderOutlined />}>
          <Link to="/user_manage">用户管理</Link>
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

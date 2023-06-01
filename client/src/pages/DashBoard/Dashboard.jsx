import React, { useContext, useState } from 'react';

import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import userContext from '../../context/userContext';
import io from 'socket.io-client';
import config from '../../api/config';

import { Link, Outlet } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

const { Header, Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, socket, setSocket } = useContext(userContext);

  const [open, setOpen] = useState(false);

  const logout = () => {
    socket.emit('logout', '');
    const newsocket = io(config.websocket_url);

    setSocket(newsocket);
    navigate('/');
  };

  return (
    <div className='dashboard'>
      <Layout className='content-drawer'>
        <Drawer
          className='drawer-custom'
          placement='left'
          size='default'
          onClose={() => setOpen(false)}
          open={open}
          collapsed={false}
        >
          <Menu
            mode='inline'
            defaultSelectedKeys={['4']}
          >
            {data.role === 'super-admin' && (
              <>
                {' '}
                <Menu.Item
                  key='0'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/admin-trans-list'>Admin Trans List</Link>
                </Menu.Item>
                <Menu.Item
                  key='1'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/create-win-number'>Input Win Num</Link>
                </Menu.Item>
                <Menu.Item
                  key='2'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/account-management'>
                    Account Management
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key='3'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/create-admin-account'>
                    Create Admin Account
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key='4'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/create-user-account-by-superadmin'>
                    Create Admin Account
                  </Link>
                </Menu.Item>
              </>
            )}
            {data.role === 'user' && (
              <>
                <Menu.Item
                  key='5'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/new-bet'>New Bet</Link>
                </Menu.Item>
                <Menu.Item
                  key='6'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/history'>History</Link>
                </Menu.Item>
                <Menu.Item
                  key='7'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/hits'>hits</Link>
                </Menu.Item>
              </>
            )}
            {data.role === 'admin' && (
              <>
                <Menu.Item
                  key='8'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/transaction-list'>Transaction List</Link>
                </Menu.Item>
                <Menu.Item
                  key='9'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/bet-list'>Bet List</Link>
                </Menu.Item>
                <Menu.Item
                  key='10'
                  icon={<VideoCameraOutlined />}
                >
                  <Link to='/dashboard/create-user-account-by-admin'>
                    Create User Account
                  </Link>
                </Menu.Item>
              </>
            )}

            <Menu.Item
              key='11'
              icon={<VideoCameraOutlined />}
            >
              <Link to='/dashboard/account-settings'>Account Settings</Link>
            </Menu.Item>
            <Menu.Item
              key='12'
              icon={<VideoCameraOutlined />}
            >
              <a onClick={logout}>Log Out</a>
            </Menu.Item>
          </Menu>
        </Drawer>
        <Layout>
          <Header className='header-layout'>
            <Button
              type='text'
              icon={open ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setOpen(true)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
          </Header>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;

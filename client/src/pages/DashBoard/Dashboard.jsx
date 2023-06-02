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
  CloseOutlined,
  AreaChartOutlined,
  BellOutlined,
  FileDoneOutlined,
  DollarOutlined,
  ControlOutlined,
  WalletOutlined,
  AimOutlined,
  UserAddOutlined,
  LogoutOutlined,
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
          closeIcon={
            <CloseOutlined style={{ color: 'white', fontSize: '26px' }} />
          }
          className='drawer-custom'
          placement='left'
          size='default'
          onClose={() => setOpen(false)}
          open={open}
          collapsed={false}
          closable={true}
        >
          <Menu
            mode='inline'
            defaultSelectedKeys={'20'}
          >
            {data.role !== 'user' && (
              <Menu.Item
                className='menuItems'
                key='20'
                icon={<AreaChartOutlined />}
              >
                <Link to='/dashboard'>DashBoard</Link>
              </Menu.Item>
            )}
            {data.role === 'super-admin' && (
              <>
                <Menu.Item
                  className='menuItems'
                  key='0'
                  icon={<FileDoneOutlined style={{ fontSize: '40px' }} />}
                >
                  <Link to='/dashboard/admin-trans-list'>Admin Trans List</Link>
                </Menu.Item>
                <Menu.Item
                  key='1'
                  icon={<BellOutlined />}
                >
                  <Link to='/dashboard/create-win-number'>Input Win Num</Link>
                </Menu.Item>
                <Menu.Item
                  key='2'
                  icon={<ControlOutlined />}
                >
                  <Link to='/dashboard/account-management'>
                    Account Management
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key='3'
                  icon={<UserAddOutlined />}
                >
                  <Link to='/dashboard/create-admin-account'>
                    Create Admin Account
                  </Link>
                </Menu.Item>
                <Menu.Item
                  key='4'
                  icon={<UserAddOutlined />}
                >
                  <Link to='/dashboard/create-user-account-by-superadmin'>
                    Create User Account
                  </Link>
                </Menu.Item>
              </>
            )}
            {data.role === 'user' && (
              <>
                <Menu.Item
                  key='5'
                  icon={<DollarOutlined />}
                >
                  <Link to='/dashboard/new-bet'>New Bet</Link>
                </Menu.Item>
                <Menu.Item
                  key='6'
                  icon={<WalletOutlined />}
                >
                  <Link to='/dashboard/history'>History</Link>
                </Menu.Item>
                <Menu.Item
                  key='7'
                  icon={<AimOutlined />}
                >
                  <Link to='/dashboard/hits'>hits</Link>
                </Menu.Item>
              </>
            )}
            {data.role === 'admin' && (
              <>
                <Menu.Item
                  className='menuItems'
                  key='8'
                  icon={<FileDoneOutlined />}
                >
                  <Link to='/dashboard/transaction-list'>Transaction List</Link>
                </Menu.Item>
                <Menu.Item
                  key='9'
                  icon={<FileDoneOutlined />}
                >
                  <Link to='/dashboard/bet-list'>Bet List</Link>
                </Menu.Item>
                <Menu.Item
                  key='10'
                  icon={<UserAddOutlined />}
                >
                  <Link to='/dashboard/create-user-account-by-admin'>
                    Create User Account
                  </Link>
                </Menu.Item>
              </>
            )}

            <Menu.Item
              key='11'
              icon={<ControlOutlined />}
            >
              <Link to='/dashboard/account-settings'>Account Settings</Link>
            </Menu.Item>
            <Menu.Item
              key='12'
              icon={<LogoutOutlined />}
            >
              <a onClick={logout}>Log Out</a>
            </Menu.Item>
          </Menu>
        </Drawer>
        <Layout>
          <Header className='header-layout'>
            <Button
              type='text'
              icon={
                open ? (
                  <MenuUnfoldOutlined
                    style={{ fontSize: '28px', color: 'white' }}
                  />
                ) : (
                  <MenuFoldOutlined
                    style={{ fontSize: '28px', color: 'white' }}
                  />
                )
              }
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

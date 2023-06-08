import React from 'react';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hits from './pages/DashBoard/Hits';
import Dashboard from './pages/DashBoard/Dashboard';
import History from './pages/DashBoard/History';
import Login from './pages/DashBoard/Login';
import NewBets from './pages/DashBoard/NewBet';
import Registration from './pages/DashBoard/Registration';
import BetList from './pages/DashBoard/BetList';
import userContext from './context/userContext';
import CreateUserAccountByAdmin from './pages/DashBoard/CreateUserAccountByAdmin';
import BetListSearch from './pages/DashBoard/BetListSearch';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import io from 'socket.io-client';

import config from './api/config';
import CreateWinNum from './pages/DashBoard/CreateWinNum';
import AdminTransList from './pages/DashBoard/AdminTransList';
import AccountManagement from './pages/DashBoard/AccountManagement';
import CreateAdminAccount from './pages/DashBoard/CreateAdminAccount';
import CreateUserAccountBySuperAdmin from './pages/DashBoard/CreateUserAccountBySuperAdmin';
import AccountSettings from './pages/DashBoard/AccountSettings';
import DashBoardMain from './pages/DashBoard/DashBoardMain';
import WinNumberHistory from './pages/DashBoard/WinNumberHistory';

const AppRouter = () => {
  const [data, setData] = useState({
    user: {},
    isAuth: false,
    role: '',
    ref_code: '',
    username: '',
  });

  const [socket, setSocket] = useState(null);

  React.useEffect(() => {
    const newsocket = io(config.websocket_url);

    setSocket(newsocket);
    return () => newsocket.disconnect();
  }, []);

  return (
    <userContext.Provider value={{ data, setData, socket, setSocket }}>
      <BrowserRouter>
        <Routes>
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <DashBoardMain />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/main'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <DashBoardMain />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/new-bet'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <NewBets />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/win-num-history'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <WinNumberHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/create-win-number'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <CreateWinNum />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/account-management'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <AccountManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path='/dashboard/create-admin-account'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <CreateAdminAccount />
                </ProtectedRoute>
              }
            />

            <Route
              path='/dashboard/account-settings'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/create-user-account-by-superadmin'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <CreateUserAccountBySuperAdmin />
                </ProtectedRoute>
              }
            />

            <Route
              path='/dashboard/hits'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <Hits />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/history'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <History />
                </ProtectedRoute>
              }
            />

            <Route
              path='/dashboard/transaction-list'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <BetList />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/bet-list'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <BetListSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/admin-trans-list'
              element={
                // <ProtectedRoute isAuth={data && data.isAuth}>
                <AdminTransList />
                // </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/registration'
              element={<Registration />}
            />
            <Route
              path='/dashboard/create-user-account-by-admin'
              element={
                <ProtectedRoute isAuth={data && data.isAuth}>
                  <CreateUserAccountByAdmin />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path='/'
            element={<Login />}
          />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
};

export default AppRouter;

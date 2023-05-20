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
    console.log('che');
    const newsocket = io(config.websocket_url);

    setSocket(newsocket);
    return () => newsocket.disconnect();
  }, []);

  return (
    <userContext.Provider value={{ data, setData, socket, setSocket }}>
      <BrowserRouter>
        <Routes>
          <Route
            path='/create-win-number'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <CreateWinNum />
              </ProtectedRoute>
            }
          />

          <Route
            path='/dashboard'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path='/hits'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <Hits />
              </ProtectedRoute>
            }
          />
          <Route
            path='/history'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path='/new-bet'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <NewBets />
              </ProtectedRoute>
            }
          />

          <Route
            path='/transaction-list'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <BetList />
              </ProtectedRoute>
            }
          />
          <Route
            path='/bet-list'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <BetListSearch />
              </ProtectedRoute>
            }
          />
          <Route path='/' element={<Login />} />
          <Route path='/registration' element={<Registration />} />
          <Route
            path='/create-user-account-by-admin'
            element={
              <ProtectedRoute isAuth={data && data.isAuth}>
                <CreateUserAccountByAdmin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
};

export default AppRouter;

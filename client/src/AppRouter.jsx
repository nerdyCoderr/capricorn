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

const AppRouter = () => {
  const [data, setData] = useState({
    user: {},
    isAuth: false,
    role: '',
    ref_code: '',
    username: '',
  });

  return (
    <userContext.Provider value={{ data, setData }}>
      <BrowserRouter>
        <Routes>
          <Route path='/dashboard' element={<Dashboard />} />

          <Route path='/hits' element={<Hits />} />
          <Route path='/history' element={<History />} />
          <Route path='/new-bet' element={<NewBets />} />

          <Route path='/transaction-list' element={<BetList />} />
          <Route path='/bet-list' element={<BetListSearch />} />
          <Route path='/' element={<Login />} />
          <Route path='/registration' element={<Registration />} />
          <Route
            path='/create-user-account-by-admin'
            element={<CreateUserAccountByAdmin />}
          />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
};

export default AppRouter;

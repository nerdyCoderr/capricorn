/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import { BsFillPencilFill, BsFillJournalBookmarkFill } from 'react-icons/bs';

import { RiContactsBookUploadFill } from 'react-icons/ri';
import { GiPowerButton } from 'react-icons/gi';
import { FaHistory } from 'react-icons/fa';
import { Card } from 'react-bootstrap';
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import userContext from '../../context/userContext';
import GlassLayout from '../../components/Layout/GlassLayout';
import io from 'socket.io-client';
import config from '../../api/config';
const Dashboard = () => {
  const navigate = useNavigate();
  const { data, socket, setSocket } = useContext(userContext);
  const [resultOverview, setResultOverview] = useState({
    total: 1,
    grandTotalAmount: 0,
    grandTotalWinAmount: 0,
    grandActualWinAmount: 0,
  });

  const logout = () => {
    socket.emit('logout', '');
    const newsocket = io(config.websocket_url);

    setSocket(newsocket);
    navigate('/');
  };

  useEffect(() => {
    const updateLimitBet = (data) => {
      console.log(data);
      setResultOverview(data.trans);
    };

    socket.emit('admin:transactionOverview', '', updateLimitBet);

    socket.on('admin:transactionOverview', (data) => setResultOverview(data));

    return () => {
      socket.off('admin:transactionOverview', (data) =>
        setResultOverview(data),
      );
    };
  }, []);

  return (
    <GlassLayout>
      <div className='dashboard'>
        <div className='dashboard-header'>
          <div className='img-fluid logo'>
            <img
              src='./capricorn_log.png'
              alt='capricorn'
              className=' img-fluid'
            />
          </div>
          <h6 className='title'>Capricorn</h6>
        </div>
        <div className='dashboard-content'>
          {data.role === 'super-admin' && (
            <Card
              className='p-2'
              onClick={() => navigate('/create-win-number')}
            >
              <div className='text-center'>
                <BsFillPencilFill size={40} />
              </div>
              <Card.Body>
                <Card.Title>
                  <p>Input Win Num</p>
                </Card.Title>
              </Card.Body>
            </Card>
          )}
          {data.role === 'user' && (
            <>
              <Card className='p-2' onClick={() => navigate('/new-bet')}>
                <div className='text-center'>
                  <BsFillPencilFill size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>New Bet</p>
                  </Card.Title>
                </Card.Body>
              </Card>
              <Card className='p-2' onClick={() => navigate('/history')}>
                <div className='text-center'>
                  <FaHistory size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>History</p>
                  </Card.Title>
                </Card.Body>
              </Card>
              <Card className='p-2' onClick={() => navigate('/hits')}>
                <div className='text-center'>
                  <BsFillJournalBookmarkFill size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>Hits</p>
                  </Card.Title>
                </Card.Body>
              </Card>
            </>
          )}
          {data.role === 'admin' && (
            <>
              <Card
                className='p-2'
                onClick={() => navigate('/transaction-list')}
              >
                <div className='text-center'>
                  <RiContactsBookUploadFill size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>Tranasction List</p>
                  </Card.Title>
                </Card.Body>
              </Card>
              <Card className='p-2' onClick={() => navigate('/bet-list')}>
                <div className='text-center'>
                  <RiContactsBookUploadFill size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>Bet List</p>
                  </Card.Title>
                </Card.Body>
              </Card>
              <Card
                className='p-2'
                onClick={() => navigate('/create-user-account-by-admin')}
              >
                <div className='text-center'>
                  <RiContactsBookUploadFill size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>Create User Account</p>
                  </Card.Title>
                </Card.Body>
              </Card>
            </>
          )}
          <Card className='p-2'>
            <div className='text-center'>
              <RiContactsBookUploadFill size={40} />
            </div>
            <Card.Body>
              <Card.Title>
                <p>Account Settings</p>
              </Card.Title>
            </Card.Body>
          </Card>
          <Card className='p-2' onClick={logout}>
            <div className='text-center'>
              <GiPowerButton size={40} />
            </div>
            <Card.Body>
              <Card.Title>
                <p>Log Out</p>
              </Card.Title>
            </Card.Body>
          </Card>
        </div>
        {data.role === 'admin' && (
          <div className='row mx-2 dashboard-total-overview'>
            <div className='col-6 col-lg-4 col-md-4 mt-1'>
              <Card className='p-2'>
                <Card.Body>
                  <Card.Title>
                    <h4> Bet Amount</h4>
                    <p> {resultOverview.grandTotalAmount}</p>
                  </Card.Title>
                </Card.Body>
              </Card>
            </div>
            <div className='col-6 col-lg-4 col-md-4 mt-1'>
              <Card className='p-2'>
                <Card.Body>
                  <Card.Title>
                    <h4> Win Amount</h4>
                    <p> {resultOverview.grandActualWinAmount}</p>
                  </Card.Title>
                </Card.Body>
              </Card>
            </div>
            <div className='col-6 col-lg-4 col-md-4 mt-1'>
              <Card className='p-2'>
                <Card.Body>
                  <h4>Profit</h4>
                  <p>
                    {resultOverview.grandTotalAmount -
                      resultOverview.grandActualWinAmount}
                  </p>
                </Card.Body>
              </Card>
            </div>
          </div>
        )}
      </div>
    </GlassLayout>
  );
};

export default Dashboard;

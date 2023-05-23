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

  const CardItem = ({ icon, title, onClick }) => (
    <Card className='p-2' onClick={onClick}>
      <div className='text-center'>{icon}</div>
      <Card.Body>
        <Card.Title>
          <p>{title}</p>
        </Card.Title>
      </Card.Body>
    </Card>
  );

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
        <div className='dashboard__header'>
          <div className='img-fluid logo'>
            <img
              src='./capricorn_log.png'
              alt='capricorn'
              className=' img-fluid'
            />
          </div>
          <h6 className='title'>Capricorn</h6>
        </div>

        <div className='dashboard__content'>
          {data.role === 'super-admin' && (
            <>
              <CardItem
                icon={<BsFillPencilFill size={40} />}
                title='Admin Trans List'
                onClick={() => navigate('/admin-trans-list')}
              />
              <CardItem
                icon={<BsFillPencilFill size={40} />}
                title='Input Win Num'
                onClick={() => navigate('/create-win-number')}
              />
            </>
          )}
          {data.role === 'user' && (
            <>
              <CardItem
                icon={<BsFillPencilFill size={40} />}
                title='New Bet'
                onClick={() => navigate('/new-bet')}
              />

              <CardItem
                icon={<FaHistory size={40} />}
                title='History'
                onClick={() => navigate('/history')}
              />

              <CardItem
                icon={<BsFillJournalBookmarkFill size={40} />}
                title='Hits'
                onClick={() => navigate('/hits')}
              />
            </>
          )}
          {data.role === 'admin' && (
            <>
              <CardItem
                icon={<RiContactsBookUploadFill size={40} />}
                title='Tranasction List'
                onClick={() => navigate('/transaction-list')}
              />

              <CardItem
                icon={<RiContactsBookUploadFill size={40} />}
                title='Bet List'
                onClick={() => navigate('/bet-list')}
              />

              <CardItem
                icon={<RiContactsBookUploadFill size={40} />}
                title='Create User Account'
                onClick={() => navigate('/create-user-account-by-admin')}
              />
            </>
          )}

          <CardItem
            icon={<RiContactsBookUploadFill size={40} />}
            title='Account Settings'
          />
          <CardItem
            icon={<GiPowerButton size={40} />}
            title='Log Out'
            onClick={logout}
          />
        </div>

        {data.role === 'admin' && (
          <div className='row mx-2 dashboard__totaloverview'>
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

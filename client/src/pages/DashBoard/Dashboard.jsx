/* eslint-disable no-unused-vars */
import React, { useContext } from 'react';
import { BsFillPencilFill, BsFillJournalBookmarkFill } from 'react-icons/bs';

import { RiContactsBookUploadFill } from 'react-icons/ri';
import { GiPowerButton } from 'react-icons/gi';
import { FaHistory } from 'react-icons/fa';
import { Card } from 'react-bootstrap';
import './Dashboard.scss';
import { useNavigate } from 'react-router-dom';
import userContext from '../../context/userContext';
import GlassLayout from '../../components/Layout/GlassLayout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data, socket } = useContext(userContext);
  console.log(data);

  const logout = () => {
    console.log(data.socketID);
    socket.emit('logout', data.socketID);

    navigate('/');
  };
  return (
    <GlassLayout>
      <div className='dashboard'>
        {' '}
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
              <Card className='p-2'>
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
      </div>
    </GlassLayout>
  );
};

export default Dashboard;

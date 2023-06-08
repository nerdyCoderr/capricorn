import React, { useContext } from 'react';
import GlassLayout from '../../components/Layout/GlassLayout';
import Chart from '../../components/Charts/Chart';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsFillPencilFill, BsFillJournalBookmarkFill } from 'react-icons/bs';
import { FaHistory } from 'react-icons/fa';
import './Dashboard.scss';
import userContext from '../../context/userContext';

function DashBoardMain() {
  const { data } = useContext(userContext);
  const navigate = useNavigate();

  return (
    <GlassLayout>
      <div className='dashboard__header'>
        <div className='img-fluid logo'>
          <img
            src='./capricorn_log.png'
            alt='capricorn'
            className=' img-fluid'
          />
        </div>
        <h6 className='title'>Capricorn</h6>
        {data?.role !== 'user' && (
          <div className='dashboard__content'>
            <Chart />
          </div>
        )}
        <div className='dashboard-content mb-5 '>
          {data.role === 'user' && (
            <>
              <Card
                className='p-2'
                onClick={() => navigate('/dashboard/new-bet')}
              >
                <div className='text-center'>
                  <BsFillPencilFill size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>New Bet</p>
                  </Card.Title>
                </Card.Body>
              </Card>
              <Card
                className='p-2'
                onClick={() => navigate('/dashboard/history')}
              >
                <div className='text-center'>
                  <FaHistory size={40} />
                </div>
                <Card.Body>
                  <Card.Title>
                    <p>History</p>
                  </Card.Title>
                </Card.Body>
              </Card>
              <Card
                className='p-2'
                onClick={() => navigate('/dashboard/hits')}
              >
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
        </div>
      </div>
    </GlassLayout>
  );
}

export default DashBoardMain;

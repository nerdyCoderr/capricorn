import React, { useContext } from 'react';
import GlassLayout from '../../components/Layout/GlassLayout';
import Chart from '../../components/Charts/Chart';

import './Dashboard.scss';
import userContext from '../../context/userContext';

function DashBoardMain() {
  const { data } = useContext(userContext);
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
      </div>
    </GlassLayout>
  );
}

export default DashBoardMain;

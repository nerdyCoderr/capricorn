import React from 'react';
import GlassLayout from '../../components/Layout/GlassLayout';
import Chart from '../../components/Charts/Chart';

import './Dashboard.scss';

function DashBoardMain() {
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
      </div>
      <div className='dashboard__content'>
        <Chart />
      </div>
    </GlassLayout>
  );
}

export default DashBoardMain;

import React from 'react';
import GlassLayout from '../../components/Layout/GlassLayout';
import Chart from '../../components/Charts/Chart';

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
        {/* {data.role === 'admin' && (
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
)} */}
      </div>
    </GlassLayout>
  );
}

export default DashBoardMain;

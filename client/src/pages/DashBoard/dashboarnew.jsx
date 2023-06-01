import React from 'react';

function dashboarnew() {
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
              <CardItem
                icon={<BsFillPencilFill size={40} />}
                title='Account Management'
                onClick={() => navigate('/account-management')}
              />
              <CardItem
                icon={<BsFillPencilFill size={40} />}
                title='Create Admin Account'
                onClick={() => navigate('/create-admin-account')}
              />
              <CardItem
                icon={<BsFillPencilFill size={40} />}
                title='Create User Account'
                onClick={() => navigate('/create-user-account-by-superadmin')}
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
                title='Transaction List'
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
            onClick={() => navigate('/account-settings')}
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
}

export default dashboarnew;

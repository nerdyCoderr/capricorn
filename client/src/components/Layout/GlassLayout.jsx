import React from 'react';
import './GlassLayout.scss';
const GlassLayout = ({ children }) => {
  return (
    <div className='container-panel'>
      <div className='glassboard-container'>
        <div className='glassboard-center'>{children}</div>
      </div>
    </div>
  );
};

export default GlassLayout;

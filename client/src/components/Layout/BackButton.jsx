import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIos } from 'react-icons/md';
import './BackButton.scss';

const BackButton = ({ title, adminData = undefined }) => {
  const nav = useNavigate();
  return (
    <div className='header-backbutton'>
      <div
        className='arrow-back'
        onClick={() => {
          if (adminData?.refcode) {
            nav(
              `/dashboard/admin-trans-list?from=${adminData.from}&to=${adminData.to}`,
            );
          } else {
            nav('/dashboard');
          }
        }}
      >
        <MdArrowBackIos
          size={25}
          color='white'
        />
      </div>
      <div className='title-container'>
        <h1 className='title'>{title}</h1>
      </div>
    </div>
  );
};

export default BackButton;

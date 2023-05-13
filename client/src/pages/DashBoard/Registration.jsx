import React from 'react';
import { registerUserAccount } from '../../api/request';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/registration/RegistrationForm';
const Registration = () => {
  const navigate = useNavigate();

  const submitHandler = (values) => {
    const form = {
      ...values,
      role: 'user',
      ref_code: 'S46YM',
      first_name: values.firstname,
      last_name: values.lastname,
      phone_number: values.phonenumber,
    };
    console.log(form);
    registerUserAccount(form, callback);
  };
  const callback = async (res) => {
    const { data, status } = await res;
    console.log(status);
    console.log(data);
    if ((status === 200) | (status === 201)) {
      navigate('/');
    }
  };
  return (
    <div className='container mt-5'>
      <RegistrationForm submitHandler={submitHandler} />
    </div>
  );
};

export default Registration;

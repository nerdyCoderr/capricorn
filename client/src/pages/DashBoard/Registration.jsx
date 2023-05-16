import React from 'react';
import { registerUserAccount } from '../../api/request';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/registration/RegistrationForm';

const Registration = () => {
  const navigate = useNavigate();
  const nav = useNavigate();
  const submitHandler = (values) => {
    const form = {
      ...values,
      role: 'user',
      ref_code: values.ref_code,
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
    <div className='createuseraccount-container'>
      <h6 onClick={() => nav('/')}>Back</h6>
      <h1 className='text-center'>Create User Account</h1>

      <RegistrationForm submitHandler={submitHandler} />
    </div>
  );
};

export default Registration;

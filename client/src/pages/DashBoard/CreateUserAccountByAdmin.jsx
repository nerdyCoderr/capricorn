import React from 'react';
import './CreateUserAccountByAdmin.scss';
import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../../components/registration/RegistrationForm';
import { registerUserAccountbyAdmin } from '../../api/request';
import { Form } from 'antd';

const CreateUserAccountByAdmin = () => {
  const nav = useNavigate();
  const [formfields] = Form.useForm(); // create a form instance

  const submitHandler = (values) => {
    console.log(values);
    const form = {
      first_name: values.firstname,
      last_name: values.lastname,
      phone_number: values.phonenumber,
      username: values.username,
      password: values.password,
    };
    console.log(form);
    registerUserAccountbyAdmin(form, callback);

    // registerUserAccount(form, callback);
    // };
  };

  const callback = async (res) => {
    console.log(res);
    const { data, status } = await res;
    console.log(status);
    console.log(data);
    if ((status === 200) | (status === 201)) {
      formfields.resetFields();
    }
  };
  return (
    <div className='createuseraccount-container'>
      <h6 onClick={() => nav('/dashboard')}>Back</h6>
      <h1 className='text-center'>Create User Account</h1>

      <RegistrationForm formfields={formfields} submitHandler={submitHandler} />
    </div>
  );
};

export default CreateUserAccountByAdmin;

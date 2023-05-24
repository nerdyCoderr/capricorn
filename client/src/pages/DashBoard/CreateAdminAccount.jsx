import React from 'react';
import './CreateUserAccountByAdmin.scss';

import RegistrationForm from '../../components/registration/RegistrationForm';
import { registerAccountbySuper } from '../../api/request';
import { Form } from 'antd';
import BackButton from '../../components/Layout/BackButton';

const CreateAdminAccount = () => {
  const title = 'Create Admin Account';

  const [formfields] = Form.useForm(); // create a form instance

  const submitHandler = (values) => {
    console.log(values);
    const form = {
      first_name: values.firstname,
      last_name: values.lastname,
      phone_number: values.phonenumber,
      username: values.username,
      password: values.password,
      link: 'admin-signup',
    };
    console.log(form);
    registerAccountbySuper(form, callback);
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
      <BackButton title={title} />

      <RegistrationForm
        formfields={formfields}
        submitHandler={submitHandler}
        type='create'
      />
    </div>
  );
};

export default CreateAdminAccount;

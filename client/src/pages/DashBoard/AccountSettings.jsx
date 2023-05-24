import React, { useContext, useEffect, useState } from 'react';
import './CreateUserAccountByAdmin.scss';

import RegistrationForm from '../../components/registration/RegistrationForm';
import { getAccountInfo, updateAccountInfo } from '../../api/request';
import { Form } from 'antd';
import BackButton from '../../components/Layout/BackButton';
import userContext from '../../context/userContext';

const AccountSettings = () => {
  const title = 'Update My Account Profile';
  const { data } = useContext(userContext);
  const [formfields] = Form.useForm(); // create a form instance
  const [accountInfo, setAccountInfo] = useState();
  const submitHandler = (values) => {
    console.log(values);
    let newform;
    const form = {
      first_name: values.firstname,
      last_name: values.lastname,
      phone_number: values.phonenumber,
      password: values.password,
    };
    console.log(form);
    if (data?.role === 'super-admin') {
      newform = { ...form, link: 'super' };
    }
    if (data?.role === 'admin') {
      newform = { ...form, link: 'admins' };
    }
    if (data?.role === 'user') {
      newform = { ...form, link: 'users' };
    }

    updateAccountInfo(newform, callback);
  };

  const callback = async (res) => {
    console.log(res);
    const { data, status } = await res;
    console.log(status);
    console.log(data);
    if ((status === 200) | (status === 201)) {
      if (data?.role === 'super-admin') {
        getAccountInfo('super', callbackInfo);
      }
      if (data?.role === 'admin') {
        getAccountInfo('admins', callbackInfo);
      }
      if (data?.role === 'user') {
        getAccountInfo('users', callbackInfo);
      }
    }
  };

  const callbackInfo = async (res) => {
    const { data } = await res;
    console.log(data);
    setAccountInfo(data?.user);
  };
  useEffect(() => {
    formfields.setFieldsValue({
      firstname: accountInfo?.first_name,
      lastname: accountInfo?.first_name,
      phonenumber: accountInfo?.phone_number,
      username: accountInfo?.username,
    });
    console.log('check');
  }, [accountInfo]);
  useEffect(() => {
    if (data?.role === 'super-admin') {
      getAccountInfo('super', callbackInfo);
    }
    if (data?.role === 'admin') {
      getAccountInfo('admins', callbackInfo);
    }
    if (data?.role === 'user') {
      getAccountInfo('users', callbackInfo);
    }
  }, []);

  return (
    <div className='createuseraccount-container'>
      <BackButton title={title} />

      <RegistrationForm
        formfields={formfields}
        submitHandler={submitHandler}
        actionCall={getAccountInfo}
        initialValues={getAccountInfo}
      />
    </div>
  );
};

export default AccountSettings;

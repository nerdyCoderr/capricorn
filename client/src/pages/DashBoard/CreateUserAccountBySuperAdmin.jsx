import React, { useEffect, useState } from 'react';
import './CreateUserAccountByAdmin.scss';

import RegistrationForm from '../../components/registration/RegistrationForm';
import { getRefCodes, registerAccountbySuper } from '../../api/request';
import { Form } from 'antd';
import BackButton from '../../components/Layout/BackButton';

const CreateUserAccountBySuperAdmin = () => {
  const title = 'Create User Account By Admin';
  const [formfields] = Form.useForm(); // create a form instance
  const [refCodesTypes, setReCodeTypes] = useState();
  const submitHandler = (values) => {
    const form = {
      first_name: values.firstname,
      last_name: values.lastname,
      phone_number: values.phonenumber,
      username: values.username,
      password: values.password,
      ref_code: values.ref_code,
      link: 'user-signup',
    };

    registerAccountbySuper(form, callback);
  };

  const callback = async (res) => {
    const { status } = await res;

    if ((status === 200) | (status === 201)) {
      formfields.resetFields();
    }
  };

  const callbackRefcodes = async (res) => {
    const { data } = await res;

    setReCodeTypes(data?.admin_ref_codes);
  };

  useEffect(() => {
    getRefCodes(callbackRefcodes);
  }, []);
  return (
    <div className='createuseraccount-container'>
      <BackButton title={title} />

      <RegistrationForm
        formfields={formfields}
        submitHandler={submitHandler}
        refCodesTypes={refCodesTypes}
        type='create'
        filterType='admin'
      />
    </div>
  );
};

export default CreateUserAccountBySuperAdmin;

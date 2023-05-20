/* eslint-disable no-undef */
import React, { useContext } from 'react';
import { Button, Form, Input, message } from 'antd';
import './Login.scss';

import { useNavigate } from 'react-router-dom';
import userContext from '../../context/userContext';

const Login = () => {
  const navigate = useNavigate();

  const { setData, socket } = useContext(userContext);

  const callback = (data) => {
    if (data.message) {
      message.success(data?.message);
      setData((prev) => {
        return {
          ...prev,
          role: data.role,
          ref_code: data.ref_code,
          username: data.username,
          isAuth: true,
          socket: socket,
          socketID: socket.id,
        };
      });

      localStorage.setItem('socketToken', `${data.token}`);
      localStorage.setItem('token', `Bearer ${data.token}`);
      navigate('/dashboard');
    } else {
      message.error(data?.error);
    }
  };
  const submitHandler = (values) => {
    console.log(values);

    socket.emit('login', values, callback);
  };

  // useEffect(() => {
  //   if (socket) {
  //     const logincred = (data) => {

  //     };

  //     socket.on('login', logincred);

  //     return () => {
  //       socket.off('login');
  //     };
  //   }
  // }, [socket]);

  return (
    <>
      <div className='login-container'>
        <div className='login-box'>
          <div className='login-header'>
            <div className='img-fluid logo'>
              <img
                src='./capricorn_log.png'
                alt='capricorn'
                className=' img-fluid'
              />
            </div>

            <h6 className='title'>Capricorn</h6>
          </div>
          <div className='login-form'>
            <Form
              name='basic'
              initialValues={{ remember: true }}
              onFinish={submitHandler}
              autoComplete='off'
            >
              <Form.Item
                place
                name='username'
                rules={[
                  { required: true, message: 'Please input your username!' },
                ]}
              >
                <Input placeholder='Username' />
              </Form.Item>

              <Form.Item
                name='password'
                rules={[
                  { required: true, message: 'Please input your password!' },
                ]}
              >
                <Input.Password placeholder='Password' />
              </Form.Item>

              <Form.Item>
                <Button
                  className='button-submit'
                  type='primary'
                  htmlType='submit'
                  block
                >
                  Submit
                </Button>
              </Form.Item>

              <Form.Item className='text-center'>
                <div
                  onClick={() => navigate('registration')}
                  className='sign-up'
                >
                  Sign Up!
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

import React, { useContext } from 'react';
import { Button, Form, Input } from 'antd';
import './Login.scss';
import { userLogin } from '../../api/request';
import { useNavigate, Link } from 'react-router-dom';
import userContext from '../../context/userContext';

const Login = () => {
  const navigate = useNavigate();
  const { setData } = useContext(userContext);

  const submitHandler = (values) => {
    console.log(values);
    userLogin(values, callback);
  };

  const callback = async (res) => {
    const { data, status } = await res;
    setData((prev) => {
      return {
        ...prev,
        role: data.role,
        ref_code: data.ref_code,
        username: data.username,
      };
    });
    console.log(data);
    if (status === 200) {
      localStorage.setItem('socketToken', `${data.token}`);
      localStorage.setItem('token', `Bearer ${data.token}`);
      navigate('/dashboard');
    }
  };
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
                <Link to='/registration' onClick className='sign-up'>
                  Sign Up!
                </Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

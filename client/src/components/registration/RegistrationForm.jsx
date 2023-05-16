import React, { useContext } from 'react';
import { Button, Form, Input } from 'antd';
import './RegistrationForm.scss';
import userContext from '../../context/userContext';

const RegistrationForm = ({ submitHandler, formfields }) => {
  // const [form] = Form.useForm(); // create a form instance
  const { data } = useContext(userContext);
  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  // Validation rules for password and confirm password fields
  const validatePassword = (rule, value, callback) => {
    if (value && value.length < 6) {
      callback('Password must be at least 6 characters long');
    } else {
      callback();
    }
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('The two passwords do not match.'));
    },
  });
  console.log(data);
  return (
    <div className='registration-form-container container'>
      <Form
        form={formfields}
        requiredMark='optional'
        layout='vertical'
        onFinish={submitHandler}
        style={{
          maxWidth: 600,
          margin: 'auto',
        }}
        validateMessages={validateMessages}
        autoComplete='off'
      >
        <Form.Item
          name='firstname'
          label='Firstname'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='lastname'
          label='Lastname'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='phonenumber'
          label='Phone Number'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='username'
          label='Username'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        {!data?.role && (
          <Form.Item
            name='ref_code'
            label='Ref Code'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item
          name='password'
          label='password'
          rules={[
            {
              required: true,
              message: 'Please input your password',
            },
            {
              validator: validatePassword,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name='confirmPassword'
          label='Confirm Password'
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password',
            },
            validateConfirmPassword,
          ]}
        >
          <Input.Password />
        </Form.Item>
        <div className='button-field'>
          <Form.Item className='text-center mx-1'>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
          <Form.Item className='text-center mx-1 '>
            <Button htmlType='button' onClick={() => formfields.resetFields()}>
              Reset
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default RegistrationForm;

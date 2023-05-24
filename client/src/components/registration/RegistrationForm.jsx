import React, { useContext } from 'react';
import { Button, Form, Input, Select } from 'antd';
import './RegistrationForm.scss';
import userContext from '../../context/userContext';

const RegistrationForm = ({
  submitHandler,
  formfields,
  refCodesTypes = [],
  initialValues = {},
  filterType = null,
  type = null,
}) => {
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
          initialValue={initialValues?.first_name}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          initialValue={initialValues?.last_name ?? ''}
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
          initialValue={initialValues?.phone_number ?? ''}
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
        {type === 'create' && (
          <Form.Item
            initialValue={initialValues?.username ?? ''}
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
        )}

        {data?.role === 'super-admin' && filterType === 'admin' && (
          <Form.Item
            name='ref_code'
            label='Ref Code'
            rules={[
              { required: true, message: 'Please select your bet type!' },
            ]}
          >
            <Select allowClear>
              {refCodesTypes ? (
                refCodesTypes.map((item, id) => (
                  <Select.Option
                    key={id}
                    value={item.ref_code}
                  >
                    {item.ref_code}
                  </Select.Option>
                ))
              ) : (
                <></>
              )}
            </Select>
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
            <Button
              type='primary'
              htmlType='submit'
            >
              Submit
            </Button>
          </Form.Item>
          <Form.Item className='text-center mx-1 '>
            <Button
              htmlType='button'
              onClick={() => formfields.resetFields()}
            >
              Reset
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default RegistrationForm;

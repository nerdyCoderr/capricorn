import React, { useEffect, useState } from 'react';
import './AccountManagement.scss';
import AntTable from '../../components/Table/AntTable';
import usePagination from '../../hooks/usePagination';
import moment from 'moment';
import { getAccountList, updateAdminUserAccount } from '../../api/request';
import BackButton from '../../components/Layout/BackButton';
import { Button, Form, Input, Modal, Switch } from 'antd';
import Filter from '../../components/Filter/Filter';
import useFilter from '../../hooks/useFilter';
import { ExclamationCircleFilled } from '@ant-design/icons';
function AccountManagement() {
  const columns = React.useMemo(
    () => [
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
        fixed: 'left',
        width: 100,
      },
      {
        title: 'Fullname',
        dataIndex: 'full_name',
        key: 'full_name',
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
      },
      {
        title: 'Active',
        dataIndex: 'active',
        key: 'active',
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        width: 150,
      },
    ],
    [],
  );
  const { confirm } = Modal;
  const dateFormat = 'YYYY-MM-DD';
  const otherparams = `&role=${'admin'}`;
  const currentDate = moment().format(dateFormat);
  const dateparams = `&from=${currentDate}&to=${currentDate}`;
  const filterType = 'superadmin';
  const [formfields] = Form.useForm(); // create a form instance

  const [totalCountTable, setTotalCountTable] = useState(0);
  const [viewEditSwitch, setViewEditSwitch] = useState(false);
  const [dataTable, setDataTabble] = useState([]);
  const [dataViewEdit, setDataViewEdit] = useState();
  const {
    isloading,
    onPrevious,
    onFirst,
    onLast,
    onNext,
    callbackresponse,
    errorResponse,
  } = usePagination('', dataTable, getAccountList, otherparams, dateparams);

  const {
    setFilter,
    filterHandler,
    onBatchChange,
    onChangeTo,
    onChangeFrom,
    resetHandler,
    filter,
    callbackfilterRes,
  } = useFilter('', currentDate, getAccountList);

  const accountStatus = (status) => {
    if (status) {
      return (
        <div className='rounded py-1 bg-success text-center text-white'>
          Active
        </div>
      );
    } else {
      return (
        <div className='rounded py-2 bg-danger text-center text-white'>
          Deactivated
        </div>
      );
    }
  };

  const activateDeactivateAccount = (data) => {
    let active;
    if (data.active) {
      active = 0;
    } else {
      active = 1;
    }

    const newdata = {
      username: data.user,
      active: active,
    };
    console.log(newdata);
    updateAdminUserAccount(newdata, callbackUpdateAccounts);
  };

  const showConfirmModal = (data) => {
    confirm({
      title: 'Are you sure you Want to Activate/Deactivate these account?',
      icon: <ExclamationCircleFilled />,
      content: (
        <>
          <div>Username: {data?.user}</div>
          <div>Fullname: {data?.fullname}</div>
          <div>Role: {data?.role}</div>
        </>
      ),
      onOk() {
        activateDeactivateAccount(data);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

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

  const submitHandler = (values) => {
    console.log(values);
    const form = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone_number: values.phone_number,
      username: values.username,
      password: values.password,
      ref_code: values.ref_code,
    };
    console.log(form);
    updateAdminUserAccount(form, callbackUpdateAccounts);
  };

  const accountAction = (
    user,
    firstname,
    lastname,
    role,
    active,
    phone,
    refcode,
  ) => {
    const data = {
      user,
      fullname: firstname + ' ' + lastname,
      role,
      active,
      phone,
      refcode,
    };
    return (
      <div className=' '>
        <Button
          className='btn- bg-primary text-white mt-1 w-100'
          onClick={() => {
            const name = data.fullname.split(' ');
            console.log(name);
            setDataViewEdit({
              ...data,
              first_name: name[0],
              last_name: name[1],
            });

            setIsViewEditModal(true);
          }}
        >
          View/Update
        </Button>
        <Button
          className={`${
            active ? 'bg-danger' : 'bg-success'
          } text-white mt-1  w-100 `}
          onClick={() => showConfirmModal(data)}
        >
          {active ? 'Deactivate' : 'Activate'}
        </Button>
      </div>
    );
  };

  const processResponseData = (response) => {
    const { data, total } = response;

    setTotalCountTable(total);

    const reconstructedList = data?.map((item) => ({
      username: item?.username,
      full_name: item?.first_name + ' ' + item?.last_name,
      role: item?.role,
      active: accountStatus(item?.active),
      action: accountAction(
        item?.username,
        item?.first_name,
        item?.last_name,
        item?.role,
        item?.active,
        item?.phone_number,
        item?.ref_code,
      ),
    }));

    return { ...response, data: reconstructedList };
  };
  const [isViewEditModal, setIsViewEditModal] = useState(false);

  const callbackUpdateAccounts = async (res) => {
    const { data, status } = await res;
    const { user } = data;

    if (status === 200) {
      setIsViewEditModal(false);
      getAccountList(`?role=${user?.role}`, callbackList);
    }
  };

  const callbackList = async (res) => {
    console.log(await res);
    setDataTabble(processResponseData(await res.data));
  };
  useEffect(() => {
    setDataTabble(processResponseData(callbackresponse));
  }, [callbackresponse]);

  useEffect(() => {
    if (callbackfilterRes) {
      const processedData = processResponseData(callbackfilterRes);
      setDataTabble(processedData);
    }
  }, [callbackfilterRes]);

  useEffect(() => {
    console.log(dataViewEdit);
  }, [dataViewEdit]);
  return (
    <div className='accountmanagement'>
      <BackButton title={'Account Management'} />

      <Filter
        setFilter={setFilter}
        filterHandler={filterHandler}
        onBatchChange={onBatchChange}
        onChangeTo={onChangeTo}
        onChangeFrom={onChangeFrom}
        resetHandler={resetHandler}
        filter={filter}
        filterType={filterType}
      />
      <Modal
        title={
          <div className='d-flex'>
            <h5 className='font-weight-bold'>
              {' '}
              {viewEditSwitch ? 'EDIT' : 'VIEW'}
            </h5>
            <Switch
              className='mx-2'
              size='large'
              checked={viewEditSwitch}
              onChange={(e) => {
                setViewEditSwitch(e);
              }}
            />
          </div>
        }
        visible={isViewEditModal}
        onCancel={() => setIsViewEditModal(false)}
        footer={null}
      >
        <>
          <Form
            form={formfields}
            layout='vertical'
            onFinish={submitHandler}
            validateMessages={validateMessages}
            autoComplete='off'
          >
            <div className='col'>
              <Form.Item
                initialValue={dataViewEdit?.user}
                name='username'
              >
                <h6>Username: {dataViewEdit?.user}</h6>
              </Form.Item>
            </div>

            <div className='row'>
              <div className='col '>
                <Form.Item
                  className='inputss'
                  initialValue={dataViewEdit?.first_name ?? '- -'}
                  name='first_name'
                  label='Firstname'
                >
                  <Input
                    className=''
                    disabled={!viewEditSwitch}
                  />
                </Form.Item>
              </div>
              <div className='col'>
                <Form.Item
                  className='inputss'
                  initialValue={dataViewEdit?.last_name ?? '- -'}
                  name='last_name'
                  label='Lastname'
                >
                  <Input disabled={!viewEditSwitch} />
                </Form.Item>
              </div>
            </div>
            <div className='row'>
              <div className='col'>
                <Form.Item
                  className='inputss'
                  initialValue={dataViewEdit?.phone}
                  name='phone_number'
                  label='Phone No.'
                >
                  <Input disabled={!viewEditSwitch} />
                </Form.Item>
              </div>
              <div className='col'>
                <Form.Item
                  className='inputss'
                  initialValue={dataViewEdit?.refcode}
                  name='ref_code'
                  label='Ref Code'
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input disabled={!viewEditSwitch} />
                </Form.Item>
              </div>
            </div>

            <Form.Item
              className='inputss'
              name='password'
              label='Password'
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
              <Input disabled={!viewEditSwitch} />
            </Form.Item>
            <Form.Item
              className='inputss'
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
              <Input.Password disabled={!viewEditSwitch} />
            </Form.Item>
            <div className='d-flex justify-content-end'>
              <Form.Item className='text-center mx-1'>
                <Button
                  type='primary'
                  htmlType='submit'
                >
                  Submit
                </Button>
              </Form.Item>
            </div>
          </Form>
        </>
      </Modal>

      <AntTable
        dataTable={dataTable}
        columns={columns}
        onNext={onNext}
        onPrevious={onPrevious}
        onFirst={onFirst}
        onLast={onLast}
        isloading={isloading}
        // handleColumnClick={handleColumnClick}
        errorResponse={errorResponse}
        totalCountTable={totalCountTable}
        scroll={{ x: 500, y: 300 }}
      />
    </div>
  );
}

export default AccountManagement;

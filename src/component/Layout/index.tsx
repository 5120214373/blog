import React, { useEffect, useState} from 'react';
import { Layout, Menu, theme, Button, Modal, Form, Input, Popconfirm,message} from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useRoutes } from 'react-router-dom'
import axios from 'axios'
import router from '../../router';
import PubSub from 'pubsub-js';
import './index.scss'

interface firstLevelType {
  _id: string
  title: string
  subLevel: any
}
interface secondLevelType {
  _id: string
  title: string
  content: string
  firstLevelId: string
}
type MenuItem = Required<MenuProps>['items'][number];
const { Header, Content, Footer, Sider } = Layout
const MyLayout: React.FC = () => {
  const [pathname,setPathname]=useState<string>('')
  let items: MenuItem[]
  //保存一级目录信息
  let [firstLevel, setFirstLevel] = useState<Array<firstLevelType>>([])
  let [curfirstLevel, setCurFirstLevel] = useState<string>('')
  //判断useEffect什么时候调用
  let [flag, setFlag] = useState<boolean>(false)
  useEffect(() => {
    PubSub.subscribe('renderContent', () => {
      setFlag(!flag)
    })
    axios.get("http://localhost:3000/api/firstLevel").then(value => {
      let arr: any = []
      value.data.data.forEach((firstLevelItem: firstLevelType, index: number) => {
        axios({
          method: 'post',
          url: 'http://localhost:3000/api/secondLevel',
          data: {
            firstLevelId: firstLevelItem._id
          }
        }).then(res => {
          firstLevelItem.subLevel = res.data.data
          res.data.data.unshift({ title: '新建', _id: `create`, firstLevelId: firstLevelItem._id })
          arr.push(firstLevelItem)
          if (index === value.data.data.length - 1) {
            setFirstLevel(arr)
          }
        })
      })
    }).catch(err => {
      console.log(err)
    })
  }, [flag])
  //Modal事件
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  //展示Modal
  const showModal1 = () => {
    setIsModalOpen1(true);
  };
  const showModal2 = () => {
    setIsModalOpen2(true);
  };

  //关闭Modal
  const handleCancel1 = () => {
    setIsModalOpen1(false);
  };
  const handleCancel2 = () => {
    setIsModalOpen2(false);
  };
  //Layout事件
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  //Form事件
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  //点击完成后关闭Modal,发请求添加目录
  const onFinish1 = (values: any) => {
    const { note1 } = values
    //发送请求，添加目录
    axios({
      method: 'post',
      url: '/api/newFirstLevel',
      data: {
        title: note1,
        subLevel: []
      }
    })
    handleCancel1()
    //清空输入框
    form1.resetFields()
    setFlag(!flag)
  };
  const onFinish2 = (values: any) => {
    const { note2 } = values
    const [firstLevelId]=pathname.split('&')
    //发送请求，添加目录
    axios({
      method: 'put',
      url: `/api/UpdateFirstLevel/${firstLevelId}`,
      data: {
        title: note2,
        subLevel: []
      }
    })
    handleCancel2()
    //清空输入框
    form2.resetFields()
    setFlag(!flag)
  };
  //清空输入框
  const onReset1 = () => {
    form1.resetFields();
  };
  const onReset2 = () => {
    form2.resetFields();
  };
  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }
  //设置一级目录
  items = firstLevel.map((firstLevelItem: firstLevelType) => {                                                           //设置二级目录
    return getItem(firstLevelItem.title, firstLevelItem._id, null, firstLevelItem.subLevel.map((secondLeveItem: secondLevelType) => {
      return getItem(secondLeveItem.title, `${secondLeveItem.firstLevelId}&${secondLeveItem._id}`)
    }))
  })
  const navigate = useNavigate()
  // submenu keys of first level
  const rootSubmenuKeys = ['sub1', 'sub2', 'sub4'];
  const [openKeys, setOpenKeys] = useState(['sub1']);
  const element = useRoutes(router)
  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };
  //路由跳转
  const onSelect = (props: { key: string }) => {
    const { key } = props
    setPathname(key)
    navigate(`/${key}`)
    const [firstLevelId]=key.split('&')
    axios({
      method:'get',
      url:`/api/firstLevel/${firstLevelId}`
    }).then(res=>{
      setCurFirstLevel(res.data.data.title)
    },err=>{
      message.error('删除失败');
    })
  }
  //点击确认
  const confirm = (e?: any) => {
    const [firstLevelId]=pathname.split('&')
    axios({
      method:'delete',
      url:`/api/deleteFirstLevel/${firstLevelId}`
    })
    navigate('/home')
    setFlag(!flag)
    message.success('删除成功');
};
//点击取消
const cancel = (e?: React.MouseEvent<HTMLElement>) => {
    message.error('删除失败');
};
  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
      >
        <Menu
          mode="inline"
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          style={{ width: 200 }}
          items={items}
          onSelect={onSelect}
        >
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button type="dashed" onClick={showModal1} style={{marginLeft:'10px'}}>新增目录</Button>
          <Popconfirm
            title="删除"
            description={`确定要删除 ${curfirstLevel} 吗`}
            onConfirm={confirm}
            onCancel={cancel}
            okText="确定"
            cancelText="取消"
        >
          <Button type="dashed" style={{marginLeft:'10px'}}>删除目录</Button>
        </Popconfirm>
          
          <Button type="dashed" onClick={showModal2} style={{marginLeft:'10px'}}>修改目录</Button>
          <Modal title="新建目录" open={isModalOpen1} onCancel={handleCancel1}>
            <Form
              {...layout}
              form={form1}
              name="control-hooks"
              onFinish={onFinish1}
              style={{ maxWidth: 600 }}
            >
              <Form.Item name="note1" label="目录名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" style={{ margin: '0 10px' }}>
                  完成
                </Button>
                <Button htmlType="button" onClick={onReset1}>
                  清空
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Modal title="修改目录" open={isModalOpen2} onCancel={handleCancel2}>
            <Form
              {...layout}
              form={form2}
              name="control-hooks"
              onFinish={onFinish2}
              style={{ maxWidth: 600 }}
            >
              <Form.Item name="note2" label="目录名称" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit" style={{ margin: '0 10px' }}>
                  完成
                </Button>
                <Button htmlType="button" onClick={onReset2}>
                  清空
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <img src='/logo.jpg' alt="" className='image' />
          <span style={{ float: 'right', fontSize: 20, fontWeight: 'bold' }}>Mr.yang的知识库</span>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
            {
              element
            }
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by Ant UED</Footer>
      </Layout>
    </Layout>
  );
};
export default MyLayout;
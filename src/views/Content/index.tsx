import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import PubSub from 'pubsub-js'
import MyPopconfirm from '../../component/Popconfirm';

import {
    Button,
    Form,
    Input,
} from 'antd';
import './index.scss'
const { TextArea } = Input;
interface titleAndContentType {
    title: string
    content: string
}
const Content: React.FC = () => {
    let [titleAndContent, setTitleAndContent]: [titleAndContentType, any] = useState({ title: "", content: "" })
    const navigate = useNavigate()
    const { id } = useParams()
    let firstLevelId: string = '', secondLevelId: string = ''
    if (id) {
        [firstLevelId, secondLevelId] = id.split('&')
    }
    useEffect(() => {
        if (secondLevelId !== 'create') {
            axios({
                method: 'post',
                url: 'http://localhost:3000/api/secondLevelContent',
                data: {
                    id: secondLevelId
                }
            }).then(res => {
                const { title, content } = res.data.data
                setTitleAndContent({ title, content })
            })
        } else {
            setTitleAndContent({ title: "", content: "" })
        }
    }, [secondLevelId])
    //Form事件
    const [form] = Form.useForm();
    //点击完成后关闭Modal,发请求添加目录
    const onFinish = (values: any) => {
        // 新创建二级目录
        if (secondLevelId === 'create') {
            const { title1, content1 } = values
            // 发送请求，添加目录
            axios({
                method: 'post',
                url: '/api/newSecondLevel',
                data: {
                    title: title1,
                    content: content1,
                    firstLevelId: firstLevelId
                }
            })
            PubSub.publish('renderContent')
            navigate('/home')
            form.resetFields()
        } else {
            const { title2, content2 } = values
            //修改二级目录
            axios({
                method: 'put',
                url: `/api/updateSecondLevel/${secondLevelId}`,
                data: {
                    title: title2,
                    content: content2,
                    firstLevelId: firstLevelId
                }
            })
            form.setFieldsValue({
                title2,
                content2
            })
            PubSub.publish('renderContent')
            setTitleAndContent({ title:title2, content:content2 })
            navigate(`/${firstLevelId}&${secondLevelId}`)
        }
    };
    //清空输入框或退出修改
    const onReset = () => {
        if (secondLevelId === 'create') {
            form.resetFields();
        }else{
            navigate(`/${firstLevelId}&${secondLevelId}`)
        }
    };
    //修改二级目录内容
    const updateContent = () => {
        navigate(`/${id}&update`)
        //设置初始值
        form.setFieldsValue({
            title2:titleAndContent.title,
            content2:titleAndContent.content
        })
    }
    //设置初始值
    const data={
        title2:titleAndContent.title,
        content2:titleAndContent.content
    }
    return (
        <div className='content'>
            {
                id && id.indexOf('create') !== -1 ? (<Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    style={{ maxWidth: 600 }}
                    name="control-hooks1"
                    onFinish={onFinish}
                    form={form}
                >
                    <Form.Item name="title1" label="标题" rules={[{ required: true }]} >
                        <Input />
                    </Form.Item>
                    <Form.Item name="content1" label="正文" rules={[{ required: true }]} >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" style={{ marginLeft: 200, marginRight: 20 }}>新建</Button>
                        <Button htmlType="button" onClick={onReset}>取消</Button>
                    </Form.Item>
                </Form>
                ) : id && id.indexOf('update') !== -1 ? (<Form
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    style={{ maxWidth: 600 }}
                    name="control-hooks2"
                    onFinish={onFinish}
                    form={form}
                    initialValues={data}
                >
                    <Form.Item name="title2" label="标题" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="content2" label="正文" rules={[{ required: true }]}>
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" style={{ marginLeft: 200, marginRight: 20 }}>完成</Button>
                        <Button htmlType="button" onClick={onReset}>取消</Button>
                    </Form.Item>
                </Form>
                ) :(
                    <div>
                        {/* <Button style={{ float: 'right' }} onClick={deteleContent}>删除</Button> */}
                        <Button style={{ float: 'right',marginRight:'40px'}} onClick={updateContent}>修改</Button>
                        <MyPopconfirm/>
                        <h2>标题:{titleAndContent.title}</h2>
                        <hr style={{ margin: '10px 0' }}></hr>
                        <h3>内容:{titleAndContent.content}</h3>
                    </div>
                )
            }
        </div>
    )
}
export default Content;


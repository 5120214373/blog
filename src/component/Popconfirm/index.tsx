import React from 'react';
import { Button, message, Popconfirm } from 'antd';
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import PubSub from 'pubsub-js';
const MyPopconfirm: React.FC = () => {
    const navigate = useNavigate()
    //点击确定，删除该博客
    const confirm = (e?: any) => {
        const { pathname } = e?.view.location
        //除去第一位'/',在分成数组
        const [firstLevelId, secondLevelId] = pathname.slice(1).split('&')
        //发送删除博客的请求
        axios({
            method: 'delete',
            url: `/api/deleteSecondLevel/${secondLevelId}`
        })
        PubSub.publish('renderContent')
        navigate(`/${firstLevelId}&create`)
        message.success('删除成功');
    };
    //点击取消
    const cancel = (e?: React.MouseEvent<HTMLElement>) => {
        message.error('删除失败');
    };
    return (
        <Popconfirm
            title="删除"
            description="确定要删除该博客吗"
            onConfirm={confirm}
            onCancel={cancel}
            okText="确定"
            cancelText="取消"
        >
            <Button style={{ float: 'right', margin: '0 10px' }}>删除</Button>
        </Popconfirm>
    );
}

export default MyPopconfirm;
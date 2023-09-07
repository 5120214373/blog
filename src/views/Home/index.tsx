import React from 'react'

export default function Home() {
  const time=+new Date()
  const day=365-Math.floor((time-1683198383449)/(60*60*24*1000))

  return (
    <div>
      <img src="/logo.jpg" alt="" style={{width:300,height:300}}/>
      <h1>学习时的苦痛是暂时的,未学到的痛苦是终生的。</h1>
      <div style={{fontSize:20,fontWeight:'bold',width:'100%'}}>365天倒计时-----{day}天</div>
    </div>
  )
}

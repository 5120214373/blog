import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {BrowserRouter} from 'react-router-dom'
//引入全局样式
import './index.scss'
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// console.log(React.version)
root.render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);


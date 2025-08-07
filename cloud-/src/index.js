// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';
import { awsconfig } from './amplify-config';
import { BrowserRouter } from 'react-router-dom'; // ⬅️ ADD THIS
import './index.css';

Amplify.configure(awsconfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ⬅️ WRAP APP HERE */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

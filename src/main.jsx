import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import AdminPanel from './AdminPanel.jsx';
import './styles.css';

const isAdmin = window.location.pathname.replace(/\/$/, '').endsWith('/admin-panel');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdmin ? <AdminPanel /> : <App />}
  </React.StrictMode>
);

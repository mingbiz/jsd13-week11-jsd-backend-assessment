/* =========================================================================
 * ENTRY POINT ของ React — เชื่อม component <App /> เข้ากับ DOM
 * ========================================================================= */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
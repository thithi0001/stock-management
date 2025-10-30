import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RefreshProvider } from "./context/RefreshContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RefreshProvider>
      <App />
    </RefreshProvider>
  </React.StrictMode>
);


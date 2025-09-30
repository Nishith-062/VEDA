import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { BrowserRouter } from 'react-router-dom'
import './i18n.js';

import { registerServiceWorker } from './serviceWorkerRegistration.js'
import { initPwaInstallListener } from "./pwa-beforeinstall";


initPwaInstallListener();
if ('serviceWorker' in navigator) {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(<App />);

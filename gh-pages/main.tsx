import React from 'react';
import { render } from 'react-dom';

import { App } from './component/App';

import './style.css';

const root = document.getElementById('app');

if (!root) throw new Error();

render(<App />, root);

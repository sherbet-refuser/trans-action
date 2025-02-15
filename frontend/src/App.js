import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';
import axios from 'axios';
import Fund from './components/Fund';
import About from './components/About';
import Aid from './components/Aid';
import './App.css';
import config from './config';

function App() {
  const [latestData, setLatestData] = useState(null);

  const refreshLatestData = () => {
    axios
      .get(config.api.endpoint + '/latest')
      .then((res) => {
        console.log('Fetched latest data:', res.data);
        setLatestData(res.data);
      })
      .catch((err) => console.error('failed to fetch latest data:', err));
  };

  useEffect(() => {
    refreshLatestData();
  }, []);

  useEffect(() => {
    if (config.app.env !== 'production') {
      document.title = '[dev] ' + document.title;
    }
  }, []);

  return (
    <Router>
      <div className="app-container">
        <header>
          {/* Trans pride flag colors: Blue: #5BCEFA, Pink: #F5A9B8, White: #FFFFFF */}
          <h1>
            <span style={{ color: '#5BCEFA' }}>Seattle</span>{' '}
            <span style={{ color: '#F5A9B8' }}>Trans</span>
            <span style={{ color: '#FFFFFF' }}>Action</span>{' '}
            <span style={{ color: '#F5A9B8' }}>Fund</span>
            {config.app.env !== 'production' && (
              <span style={{ color: '#5BCEFA' }}> [dev]</span>
            )}
          </h1>
        </header>
        <nav>
          <NavLink
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' active' : '')
            }
            to="/aid"
          >
            aid
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' active' : '')
            }
            to="/fund"
          >
            fund
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              'nav-link' + (isActive ? ' active' : '')
            }
            to="/about"
          >
            about
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate replace to="/aid" />} />
          <Route
            path="/aid"
            element={
              <Aid
                latestRequests={latestData ? latestData.requests : null}
                refreshData={refreshLatestData}
              />
            }
          />
          <Route path="/fund" element={<Fund latestData={latestData} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

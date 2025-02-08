import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Fund from './components/Fund';
import About from './components/About';
import Aid from './components/Aid';
import './App.css';
import config from './config';

function App() {
  const [view, setView] = useState('fund'); // 'fund', 'about', 'aid'
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

  return (
    <div className="app-container">
      <header>
        {/* Trans pride flag colors: Blue: #5BCEFA, Pink: #F5A9B8, White: #FFFFFF */}
        <h1>
          <span style={{ color: '#5BCEFA' }}>Seattle</span>{' '}
          <span style={{ color: '#F5A9B8' }}>Trans</span>
          <span style={{ color: '#FFFFFF' }}>Action</span>{' '}
          <span style={{ color: '#F5A9B8' }}>Fund</span>
        </h1>
      </header>
      <nav>
        <button
          className={view === 'fund' ? 'active' : ''}
          onClick={() => setView('fund')}
        >
          fund
        </button>
        <button
          className={view === 'aid' ? 'active' : ''}
          onClick={() => setView('aid')}
        >
          aid
        </button>
        <button
          className={view === 'about' ? 'active' : ''}
          onClick={() => setView('about')}
        >
          about
        </button>
      </nav>
      {view === 'fund' && <Fund latestData={latestData} />}
      {view === 'aid' && (
        <Aid
          latestRequests={latestData ? latestData.requests : []}
          refreshData={refreshLatestData}
        />
      )}
      {view === 'about' && <About />}
    </div>
  );
}

export default App;

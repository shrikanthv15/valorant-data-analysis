import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import Home from './pages/Home';
import MatchDetails from './pages/MatchDetails';
import LoadingScreen from './components/LoadingScreen';
import { Layout } from './components/Layout';

function App() {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const handleLoadComplete = () => {
    setLoadingComplete(true);
  };
  return (
    <div className="App">
      {!loadingComplete && <LoadingScreen onLoadComplete={handleLoadComplete} />}
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/match/:matchId" element={<MatchDetails />} />
          {/* Fallback to home to avoid blank screens on unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;

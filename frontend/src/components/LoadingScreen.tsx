// components/LoadingScreen.tsx
import React, { useEffect, useState } from 'react';
import '../css/loading.css';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [showStart, setShowStart] = useState(false);

  // Instantly open curtains, then show Start button

  useEffect(() => {
    const t = setTimeout(() => {
      setCurtainsOpen(true);
      setShowStart(true);
    }, 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`valorant-loading-screen`}>
      {/* Background */}
      <div className="loading-background">
        <div className="bg-particles"></div>
        <div className="bg-gradient-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="loading-content">
        {/* Valorant Logo Area */}
        <div className="valorant-logo-section">
          <div className="logo-container">
            <div className="valorant-logo">
              <span className="logo-text">VALORANT</span>
              <span className="logo-subtitle">CHAMPIONS ANALYTICS</span>
            </div>
          </div>
        </div>

        {/* Showcase Message */}
        <div className="main-message">
          <h1 className="experience-title">
            Showcasing VALORANT
            <span className="title-highlight"> like never before</span>
          </h1>
          
          <div className="subtitle-container">
            <p className="experience-subtitle">
              Dive into the brackets and explore pro-level insights
            </p>
          </div>
        </div>

        {showStart && (
          <div style={{ marginTop: 24 }}>
            <button className="start-button" onClick={onLoadComplete}>
              Start
            </button>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="decorative-elements">
          <div className="corner-decoration top-left"></div>
          <div className="corner-decoration top-right"></div>
          <div className="corner-decoration bottom-left"></div>
          <div className="corner-decoration bottom-right"></div>
        </div>
      </div>

      {/* Valorant-Style Curtains */}
      <div className={`curtain-container ${curtainsOpen ? 'curtains-open' : ''}`}>
        <div className="curtain curtain-left">
          <div className="curtain-inner"></div>
        </div>
        <div className="curtain curtain-right">
          <div className="curtain-inner"></div>
        </div>
      </div>

      {/* Particle Effects */}
      <div className="particle-effects">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className={`particle particle-${i}`}></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;

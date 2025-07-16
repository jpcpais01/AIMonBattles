import React from 'react';
import { getTypeColor } from '../data/cards';
import './ProgressBar.css';

const ProgressBar = ({ currentPower, maxPower, selectedCards, isPowerFull, cardCount, maxCards, skipCount, maxSkips }) => {
  const percentage = (currentPower / maxPower) * 100;

  const getPowerColor = (power) => {
    if (power >= 18) return '#ff0066'; // Legendary - Hot Pink
    if (power >= 15) return '#ff3300'; // Epic - Red
    if (power >= 12) return '#ff6600'; // Rare - Orange
    if (power >= 8) return '#ffcc00'; // Uncommon - Yellow
    if (power >= 5) return '#00ccff'; // Common - Blue
    return '#66ff66'; // Basic - Green
  };

  const getPowerStatus = () => {
    if (currentPower >= 100) return { text: 'ULTIMATE POWER', color: '#ff0066' };
    if (currentPower >= 80) return { text: 'LEGENDARY', color: '#ff3300' };
    if (currentPower >= 60) return { text: 'EPIC', color: '#ff6600' };
    if (currentPower >= 40) return { text: 'RARE', color: '#ffcc00' };
    if (currentPower >= 20) return { text: 'UNCOMMON', color: '#00ccff' };
    return { text: 'BUILDING', color: '#66ff66' };
  };

  const powerStatus = getPowerStatus();

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h3 className="progress-title">Power Level</h3>
        <div className="power-display">
          <span className="power-counter">
            {currentPower} / {maxPower}
          </span>
          <span 
            className="power-status-badge"
            style={{ 
              backgroundColor: powerStatus.color,
              boxShadow: `0 0 10px ${powerStatus.color}33`
            }}
          >
            {powerStatus.text}
          </span>
        </div>
      </div>
      
      <div className="limits-display">
        <div className="limit-item">
          <span className="limit-label">Cards:</span>
          <span className={`limit-counter ${cardCount >= maxCards ? 'limit-reached' : ''}`}>
            {cardCount} / {maxCards}
          </span>
        </div>
        <div className="limit-item">
          <span className="limit-label">Skips:</span>
          <span className={`limit-counter ${skipCount >= maxSkips ? 'limit-reached' : ''}`}>
            {skipCount} / {maxSkips}
          </span>
        </div>
      </div>
      
      <div className="progress-bar glass-dark">
        <div 
          className={`progress-fill ${isPowerFull ? 'full-power' : ''}`}
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            background: isPowerFull 
              ? 'linear-gradient(90deg, #ff0066, #ff3300, #ff6600)'
              : `linear-gradient(90deg, #66ff66, #00ccff, #ffcc00, #ff6600)`
          }}
        >
          <div className="progress-shine"></div>
        </div>
      </div>
      
      {selectedCards.length > 0 && (
        <div className="selected-cards">
          <div className="selected-cards-list">
            {selectedCards.map((card, index) => (
              <div 
                key={card.id}
                className="selected-card-item"
                style={{ 
                  backgroundColor: getTypeColor(card.type),
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {card.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 
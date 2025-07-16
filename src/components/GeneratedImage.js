import React, { useState } from 'react';
import { getTypeColor } from '../data/cards';
import './GeneratedImage.css';

const GeneratedImage = ({ imageUrl, prompt, selectedCards, totalPower, monsterStats, isGenerating, onRestart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);

  const getPowerColor = (power) => {
    if (power >= 100) return '#ff0066'; // Ultimate - Hot Pink
    if (power >= 80) return '#ff3300'; // Legendary - Red
    if (power >= 60) return '#ff6600'; // Epic - Orange
    if (power >= 40) return '#ffcc00'; // Rare - Yellow
    if (power >= 20) return '#00ccff'; // Uncommon - Blue
    return '#66ff66'; // Basic - Green
  };

  const getPowerRarity = (power) => {
    if (power >= 100) return 'ULTIMATE';
    if (power >= 80) return 'LEGENDARY';
    if (power >= 60) return 'EPIC';
    if (power >= 40) return 'RARE';
    if (power >= 20) return 'UNCOMMON';
    return 'BASIC';
  };

  return (
    <div className="generated-image-container">
      <div className="result-header">
        <h2 className="result-title">Your Creature is Ready</h2>
        <p className="result-subtitle">Forged with {totalPower} power points</p>
      </div>

      {isGenerating ? (
        <div className="generating-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="generating-text">Forging your creature...</h3>
          <p className="generating-subtitle">Channeling {totalPower} power points</p>
        </div>
      ) : (
        <div className="result-content">
          {/* Professional TCG Card */}
          <div className="trading-card" style={{
            borderColor: getPowerColor(totalPower),
            boxShadow: `0 0 30px ${getPowerColor(totalPower)}44, inset 0 0 0 2px ${getPowerColor(totalPower)}88`
          }}>
            
            {/* Card Header */}
            <div className="card-header">
              <div className="card-name-banner">
                <h2 className="card-name">
                  {monsterStats ? monsterStats.name : 'Mystical Creature'}
                </h2>
              </div>
            </div>

            {/* Card Image Area */}
            <div className="card-image-frame">
              <div className="card-image-container" onClick={() => setShowImagePopup(true)}>
                {imageUrl && (
                  <img 
                    src={imageUrl} 
                    alt="Generated AI Creature"
                    className={`card-creature-image ${imageLoaded ? 'loaded' : ''}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                )}
                {!imageLoaded && imageUrl && (
                  <div className="image-loading">
                    <div className="loading-spinner small">
                      <div className="spinner-ring"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card Info Section */}
            <div className="card-info-section">
              {monsterStats ? (
                <>
                  <div className="card-description">
                    <p>{monsterStats.description}</p>
                  </div>
                  
                  <div className="card-abilities">
                    {monsterStats.abilities.map((ability, index) => (
                      ability.name !== 'None' && (
                        <div key={index} className="ability-entry">
                          <div className="ability-name-line">
                            <span className="ability-name">{ability.name}</span>
                            <span className="ability-cost">{ability.power}</span>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </>
              ) : (
                <div className="stats-loading">
                  <div className="loading-spinner small">
                    <div className="spinner-ring"></div>
                  </div>
                  <p>Analyzing creature...</p>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="card-footer">
              <div className="card-stats">
                <div className="stat-block">
                  <span className="stat-value">{totalPower}</span>
                  <span className="stat-label">PWR</span>
                </div>
                <div className="card-rarity-power">
                  <span className="rarity-text" style={{ color: getPowerColor(totalPower) }}>
                    {getPowerRarity(totalPower)}
                  </span>
                </div>
                <div className="card-set-info">
                  <span className="set-name">AI MON</span>
                  <span className="card-number">#{String(Date.now()).slice(-3)}</span>
                </div>
              </div>
            </div>

            {/* Card Border Overlay */}
            <div className="card-border-overlay" style={{
              background: `linear-gradient(135deg, ${getPowerColor(totalPower)}22 0%, transparent 50%, ${getPowerColor(totalPower)}22 100%)`
            }}></div>
          </div>

          {/* Action Buttons */}
          <div className="result-actions">
            <button 
              className="action-button prompt-button"
              onClick={() => setShowPrompt(true)}
            >
              <span>📝</span>
              <span>View Prompt</span>
            </button>
            
            <button 
              className="action-button download-button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `ai-creature-${totalPower}power.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              disabled={!imageUrl}
            >
              <span>📥</span>
              <span>Download</span>
            </button>
            
            <button 
              className="action-button restart-button"
              onClick={onRestart}
            >
              <span>🔄</span>
              <span>Forge Another</span>
            </button>
          </div>
        </div>
      )}

      {/* Prompt Popup Modal */}
      {showPrompt && (
        <div className="prompt-modal-overlay" onClick={() => setShowPrompt(false)}>
          <div className="prompt-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="prompt-modal-header">
              <h3>Generation Prompt</h3>
              <button 
                className="close-button"
                onClick={() => setShowPrompt(false)}
              >
                ×
              </button>
            </div>
            <div className="prompt-modal-content">
              <p className="prompt-text">{prompt}</p>
              <div className="prompt-cards">
                <h4>Cards Used:</h4>
                <div className="prompt-cards-list">
                  {selectedCards.map((card, index) => (
                    <span 
                      key={card.id}
                      className="prompt-card-tag"
                      style={{ backgroundColor: getTypeColor(card.type) }}
                    >
                      {card.text} ({card.power})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Popup Modal */}
      {showImagePopup && imageUrl && (
        <div className="image-popup-overlay" onClick={() => setShowImagePopup(false)}>
          <div className="image-popup-container" onClick={(e) => e.stopPropagation()}>
            <img 
              src={imageUrl} 
              alt="Full Size AI Creature"
              className="image-popup-full"
            />
            <button 
              className="image-popup-close"
              onClick={() => setShowImagePopup(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedImage; 
import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { getTypeColor } from '../data/cards';
import './SwipeCard.css';

const SwipeCard = ({ card, onSwipe, currentPower, maxPower, skipCount, maxSkips, cardCount, maxCards }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState(null);

  const [{ x, y, rotate, scale }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    config: { friction: 50, tension: 500 }
  }));

  const bind = useDrag(({ active, movement: [mx, my], direction: [xDir], velocity, cancel }) => {
    const trigger = Math.abs(mx) > 100 || Math.abs(velocity[0]) > 0.2;
    
    setIsDragging(active);
    setDragDirection(mx > 50 ? 'right' : mx < -50 ? 'left' : null);

    if (!active && trigger) {
      // Card is swiped away - use movement direction, not xDir
      const direction = mx > 0 ? 'right' : 'left';
      const dir = mx > 0 ? 1 : -1;
      
      // Block swipes if limits are exceeded
      if (direction === 'right' && isBlocked) {
        // Bounce back if trying to select but blocked
        api.start({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          immediate: false
        });
        return;
      }
      
      if (direction === 'left' && wouldExceedSkipLimit) {
        // Bounce back if trying to skip but skip limit reached
        api.start({
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          immediate: false
        });
        return;
      }
      
      console.log(`Swiped ${direction} (mx: ${mx}, dir: ${dir})`);
      
      api.start({
        x: (200 + window.innerWidth) * dir,
        y: my,
        rotate: dir * 10 * (Math.abs(velocity[0]) || 1),
        scale: 1,
        immediate: (key) => key === 'x'
      });
      
      setTimeout(() => {
        onSwipe(direction, card);
      }, 200);
      return;
    }

    api.start({
      x: active ? mx : 0,
      y: active ? my : 0,
      rotate: active ? mx / 100 : 0,
      scale: active ? 1.1 : 1,
      immediate: false
    });
  });

  const getCardEmoji = (type) => {
    const emojis = {
      creature: '🐲',
      environment: '🌍',
      power: '⚡',
      style: '🎨',
      attribute: '💎',
      mood: '😊'
    };
    return emojis[type] || '✨';
  };

  const getPowerColor = (power) => {
    if (power >= 18) return '#ff0066'; // Legendary - Hot Pink
    if (power >= 15) return '#ff3300'; // Epic - Red
    if (power >= 12) return '#ff6600'; // Rare - Orange
    if (power >= 8) return '#ffcc00'; // Uncommon - Yellow
    if (power >= 5) return '#00ccff'; // Common - Blue
    return '#66ff66'; // Basic - Green
  };

  const getPowerRarity = (power) => {
    if (power >= 18) return 'LEGENDARY';
    if (power >= 15) return 'EPIC';
    if (power >= 12) return 'RARE';
    if (power >= 8) return 'UNCOMMON';
    if (power >= 5) return 'COMMON';
    return 'BASIC';
  };

  const wouldExceedPower = currentPower + card.power > maxPower;
  const wouldExceedCardLimit = cardCount >= maxCards;
  const wouldExceedSkipLimit = skipCount >= maxSkips;
  const isBlocked = wouldExceedPower || wouldExceedCardLimit;

  return (
    <animated.div
      {...bind()}
      className={`swipe-card ${isDragging ? 'dragging' : ''} ${isBlocked ? 'power-exceeded' : ''}`}
      style={{
        x,
        y,
        rotate,
        scale,
        touchAction: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div className="card-content glass">
        {/* Power Value Display */}
        <div 
          className="card-power-badge"
          style={{ 
            backgroundColor: getPowerColor(card.power),
            boxShadow: `0 0 10px ${getPowerColor(card.power)}33`
          }}
        >
          <span className="power-value">{card.power}</span>
          <span className="power-rarity">{getPowerRarity(card.power)}</span>
        </div>

        {/* Card Type Badge */}
        <div 
          className="card-type-badge"
          style={{ backgroundColor: getTypeColor(card.type) }}
        >
          <span className="card-type">{card.type}</span>
        </div>

        {/* Card Main Content */}
        <div className="card-main">
          <h2 className="card-title">{card.text}</h2>
          <div className="card-description">
            <p>Power: {card.power} • {card.type}</p>
            {wouldExceedPower && (
              <p className="power-warning">⚠️ Would exceed 100 power limit!</p>
            )}
            {wouldExceedCardLimit && (
              <p className="power-warning">⚠️ Maximum 10 cards reached!</p>
            )}
            {wouldExceedSkipLimit && (
              <p className="power-warning">⚠️ Maximum 10 skips reached!</p>
            )}
          </div>
        </div>

        {/* Swipe Indicators */}
        <div className={`swipe-indicator left ${dragDirection === 'left' ? 'active' : ''} ${wouldExceedSkipLimit ? 'blocked' : ''}`}>
          <span>{wouldExceedSkipLimit ? '🚫' : '❌'}</span>
          <span>{wouldExceedSkipLimit ? 'NO SKIPS' : 'SKIP'}</span>
        </div>
        <div className={`swipe-indicator right ${dragDirection === 'right' ? 'active' : ''} ${isBlocked ? 'blocked' : ''}`}>
          <span>{isBlocked ? '🚫' : '✅'}</span>
          <span>{isBlocked ? 'BLOCKED' : 'SELECT'}</span>
        </div>

        {/* Card Background Effect */}
        <div className="card-background-effect">
          <div className="card-glow" style={{ 
            background: `radial-gradient(circle, ${getPowerColor(card.power)}22, transparent)` 
          }}></div>
        </div>
      </div>
    </animated.div>
  );
};

export default SwipeCard; 
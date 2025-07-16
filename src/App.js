import React, { useState, useEffect } from 'react';
import './App.css';
import { getRandomCards, getRoundOfCards, calculateTotalPower, debugCategoryDistribution } from './data/cards';
import { generateImage, buildPrompt, generatePlaceholderImage } from './services/huggingface';
import { analyzeMonsterImage } from './services/groq';
import SwipeCard from './components/SwipeCard';
import ProgressBar from './components/ProgressBar';
import GeneratedImage from './components/GeneratedImage';

function App() {
  const [currentCards, setCurrentCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [usedCardIds, setUsedCardIds] = useState([]);
  const [selectedTypeCount, setSelectedTypeCount] = useState({});
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [monsterStats, setMonsterStats] = useState(null);
  const [gamePhase, setGamePhase] = useState('selection'); // 'selection' or 'result'
  const [showInstructions, setShowInstructions] = useState(true);
  const [skipCount, setSkipCount] = useState(0);
  const [maxSkips] = useState(10);
  const [maxCards] = useState(10);

  // Initialize cards on component mount
  useEffect(() => {
    console.log('🎮 AI Monster Battles - Round-Robin System Active (5 Categories)!');
    debugCategoryDistribution();
    loadNewCards();
  }, []);

  // Skip current card if it becomes invalid due to type limits
  useEffect(() => {
    if (currentCards.length > 0 && currentCardIndex < currentCards.length) {
      const currentCard = currentCards[currentCardIndex];
      const typeCount = selectedTypeCount[currentCard.type] || 0;
      
      if (typeCount >= 2) {
        // Current card is now invalid, move to next valid card
        moveToNextValidCard();
      }
    }
  }, [selectedTypeCount, currentCards, currentCardIndex]);

  const getExcludedTypes = () => {
    return Object.keys(selectedTypeCount).filter(type => selectedTypeCount[type] >= 2);
  };

  const moveToNextValidCard = () => {
    let nextIndex = currentCardIndex + 1;
    
    // Skip cards that have reached their type limit
    while (nextIndex < currentCards.length) {
      const nextCard = currentCards[nextIndex];
      const typeCount = selectedTypeCount[nextCard.type] || 0;
      
      if (typeCount < 2) {
        // Found a valid card
        setCurrentCardIndex(nextIndex);
        return;
      }
      nextIndex++;
    }
    
    // No valid cards left in current batch, load new cards
    loadNewCards();
  };

  const loadNewCards = () => {
    const excludedTypes = getExcludedTypes();
    
    // ROUND-ROBIN SYSTEM: Get one card from each category for balanced gameplay (5 categories)
    console.log('🎲 Loading new round of cards...');
    console.log('📋 Excluded types:', excludedTypes);
    console.log('🚫 Used card IDs:', usedCardIds.length);
    console.log('📊 Current limits - Cards:', selectedCards.length, '/', maxCards, '• Skips:', skipCount, '/', maxSkips);
    
    const newCards = getRoundOfCards(usedCardIds, excludedTypes);
    console.log('🎯 New round loaded:', newCards.map(card => `${card.text} (${card.type}, ${card.power})`));
    
    setCurrentCards(newCards);
    
    // Find the first valid card (should be index 0 since we're filtering, but just to be safe)
    let validIndex = 0;
    for (let i = 0; i < newCards.length; i++) {
      const typeCount = selectedTypeCount[newCards[i].type] || 0;
      if (typeCount < 2) {
        validIndex = i;
        break;
      }
    }
    setCurrentCardIndex(validIndex);
  };

  const handleCardSwipe = (direction, card) => {
    // Add card to used cards regardless of direction
    setUsedCardIds(prev => [...prev, card.id]);
    
    const currentPower = calculateTotalPower(selectedCards);
    
    if (direction === 'right' && currentPower < 100 && selectedCards.length < maxCards) {
      const newPower = currentPower + card.power;
      const currentTypeCount = selectedTypeCount[card.type] || 0;
      
      // Only add if it doesn't exceed 100 power AND doesn't exceed type limit AND doesn't exceed card limit
      if (newPower <= 100 && currentTypeCount < 2 && selectedCards.length < maxCards) {
        setSelectedCards(prev => [...prev, card]);
        
        // Update type count
        setSelectedTypeCount(prev => ({
          ...prev,
          [card.type]: (prev[card.type] || 0) + 1
        }));
      }
    } else if (direction === 'left') {
      // Track skips (left swipes)
      setSkipCount(prev => prev + 1);
    }
    
    // Move to next card
    moveToNextValidCard();
  };

  const handleGenerateImage = async () => {
    if (selectedCards.length === 0) return;
    
    setIsGenerating(true);
    setGamePhase('result');
    
    try {
      // Generate AI-powered prompt from selected cards
      console.log('🤖 Generating AI-powered prompt...');
      const prompt = await buildPrompt(selectedCards);
      console.log('✅ Generated AI prompt:', prompt);
      
      // Store the generated prompt in state
      setGeneratedPrompt(prompt);
      
      let finalImageUrl = null;
      
      // Try to generate REAL AI image with Hugging Face API
      console.log('🚀 Attempting to generate REAL AI image...');
      try {
        const imageUrl = await generateImage(prompt, selectedCards);
        console.log('🎉 Successfully generated REAL AI image!');
        finalImageUrl = imageUrl;
      } catch (error) {
        console.error('❌ Failed to generate AI image:', error);
        
        // Show different messages based on error type
        if (error.message.includes('API key')) {
          console.log('⚠️  API key issue - check your Hugging Face API key');
          alert('⚠️  Please configure your Hugging Face API key!\n\n1. Go to https://huggingface.co/settings/tokens\n2. Create a new token\n3. Set REACT_APP_HF_API_KEY in your environment or replace in code');
        } else if (error.message.includes('Payment Required')) {
          console.log('💰 Payment required - check your Hugging Face billing');
          alert('💰 Hugging Face API Payment Required!\n\nYour API key has reached its quota or billing limit.\n\n1. Go to https://huggingface.co/settings/billing\n2. Check your usage and billing status\n3. Upgrade your plan if needed\n\nFor now, using placeholder image...');
        } else {
          console.log('💥 API failed, falling back to placeholder...');
        }
        
        // Fallback to placeholder
        finalImageUrl = generatePlaceholderImage(prompt);
      }
      
      // Analyze the monster image with Groq AI
      console.log('🧠 Analyzing monster with Groq AI...');
      const stats = await analyzeMonsterImage(finalImageUrl, prompt);
      
      // Set both image and stats
      setGeneratedImageUrl(finalImageUrl);
      setMonsterStats(stats);
      
    } catch (error) {
      console.error('Error in image generation:', error);
      // Even more fallback
      const placeholderUrl = generatePlaceholderImage('Error generating image');
      setGeneratedImageUrl(placeholderUrl);
      setMonsterStats({
        name: 'Error Creature',
        description: 'A creature born from digital chaos.',
        abilities: [
          { name: 'Debug Strike', power: 10 },
          { name: 'None', power: 0 },
          { name: 'None', power: 0 }
        ]
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    setSelectedCards([]);
    setUsedCardIds([]);
    setSelectedTypeCount({});
    setCurrentCardIndex(0);
    setGeneratedImageUrl(null);
    setGeneratedPrompt('');
    setMonsterStats(null);
    setGamePhase('selection');
    setSkipCount(0);
    setCurrentCards([]); // Clear current cards first
    
    // Use setTimeout to ensure state is cleared before loading new cards
    setTimeout(() => {
      loadNewCards();
    }, 0);
  };

  const getCurrentCard = () => {
    if (currentCardIndex < currentCards.length) {
      return currentCards[currentCardIndex];
    }
    return null;
  };

  const getCardDisplayState = () => {
    // Check if we've reached limits
    if (selectedCards.length >= maxCards) {
      return { type: 'maxCards', message: 'Maximum cards reached! Ready to forge your monster.' };
    }
    
    if (skipCount >= maxSkips) {
      return { type: 'maxSkips', message: 'Maximum skips reached! Please select from remaining cards.' };
    }
    
    // Check if we have a current card
    const currentCard = getCurrentCard();
    if (currentCard) {
      return { type: 'card', card: currentCard };
    }
    
    // No cards available
    return { type: 'noCards', message: 'No more cards available. Generate your monster!' };
  };

  const currentPower = calculateTotalPower(selectedCards);
  const canGenerate = selectedCards.length >= 3 && currentPower >= 50; // Minimum 3 cards and 50 power
  const isPowerFull = currentPower >= 100;
  const isCardsMaxed = selectedCards.length >= maxCards;
  const isSkipsMaxed = skipCount >= maxSkips;

  const cardState = getCardDisplayState();

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-gradient">AI Monster Battles</span>
        </h1>
      </header>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="instructions-overlay">
          <div className="instructions-modal glass">
            <h2>How to Play</h2>
            <div className="instructions-content">
              <div className="instruction-item">
                <span className="instruction-icon">👉</span>
                <span>Swipe RIGHT to select cards</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">👈</span>
                <span>Swipe LEFT to skip cards</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⚡</span>
                <span>Collect up to 100 power points</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎨</span>
                <span>Generate your creature when ready!</span>
              </div>
            </div>
            <button 
              className="start-button"
              onClick={() => setShowInstructions(false)}
            >
              Start Forging
            </button>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <main className="app-main">
        {gamePhase === 'selection' ? (
          <>
            {/* Progress Bar */}
            <ProgressBar 
              currentPower={currentPower}
              maxPower={100}
              selectedCards={selectedCards}
              isPowerFull={isPowerFull}
              cardCount={selectedCards.length}
              maxCards={maxCards}
              skipCount={skipCount}
              maxSkips={maxSkips}
            />

            {/* Card Stack */}
            <div className="card-stack">
              {cardState.type === 'card' && (
                <SwipeCard 
                  card={cardState.card}
                  onSwipe={handleCardSwipe}
                  key={cardState.card.id}
                  currentPower={currentPower}
                  maxPower={100}
                  skipCount={skipCount}
                  maxSkips={maxSkips}
                  cardCount={selectedCards.length}
                  maxCards={maxCards}
                />
              )}
              {cardState.type === 'maxCards' && (
                <div className="card-message">
                  <p>{cardState.message}</p>
                  {canGenerate && (
                    <button 
                      className={`generate-button ${isPowerFull ? 'full-power' : ''}`}
                      onClick={handleGenerateImage}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <span>⚡ Forging...</span>
                      ) : (
                        <span>
                          {isPowerFull ? '🔥 Forge Ultimate Creature' : `⚡ Forge Creature (${currentPower}/100)`}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              )}
              {cardState.type === 'maxSkips' && (
                <div className="card-message">
                  <p>{cardState.message}</p>
                  <button 
                    className="start-button"
                    onClick={loadNewCards}
                  >
                    Load New Cards
                  </button>
                </div>
              )}
              {cardState.type === 'noCards' && (
                <div className="card-message">
                  <p>{cardState.message}</p>
                  <button 
                    className="start-button"
                    onClick={handleRestart}
                  >
                    Restart Game
                  </button>
                </div>
              )}
            </div>

            {/* Generate Button */}
            {canGenerate && cardState.type === 'card' && (
              <button 
                className={`generate-button ${isPowerFull ? 'full-power' : ''}`}
                onClick={handleGenerateImage}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span>⚡ Forging...</span>
                ) : (
                  <span>
                    {isPowerFull ? '🔥 Forge Ultimate Creature' : `⚡ Forge Creature (${currentPower}/100)`}
                  </span>
                )}
              </button>
            )}

            {/* Power Status */}
            <div className="power-status">
              <span className="power-indicator">
                ⚡ {currentPower}/100 Power
              </span>
            </div>
          </>
        ) : (
          <GeneratedImage 
            imageUrl={generatedImageUrl}
            prompt={generatedPrompt}
            selectedCards={selectedCards}
            totalPower={currentPower}
            monsterStats={monsterStats}
            isGenerating={isGenerating}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Forge legendary creatures with AI power</p>
      </footer>
    </div>
  );
}

export default App; 
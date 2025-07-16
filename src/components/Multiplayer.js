import React, { useState, useEffect } from 'react';
import './Multiplayer.css';
import socketService from '../services/socket';

const Multiplayer = ({ monster, onClose }) => {
  const [phase, setPhase] = useState('connecting'); // connecting, waiting, room, battle, result
  const [roomData, setRoomData] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [battleResult, setBattleResult] = useState(null);
  const [battleNarrative, setBattleNarrative] = useState([]);
  const [currentNarrativeIndex, setCurrentNarrativeIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to socket and join multiplayer
    try {
      socketService.connect();
      
      // Setup event listeners
      socketService.onWaitingForOpponent(() => {
        console.log('⏳ Waiting for opponent...');
        setPhase('waiting');
      });

      socketService.onRoomJoined((data) => {
        console.log('🏟️ Room joined:', data);
        setRoomData(data);
        setPhase('room');
        
        // Find opponent
        const opponentPlayer = data.players.find(p => p.id !== data.yourPlayerId);
        setOpponent(opponentPlayer);
      });

      socketService.onPlayerReadyUpdate((data) => {
        if (data.playerId !== socketService.socket.id) {
          setOpponentReady(data.ready);
        }
      });

      socketService.onBattleStarted(() => {
        console.log('🔥 Battle started!');
        setPhase('battle');
        setCurrentNarrativeIndex(0);
      });

      socketService.onBattleResult((result) => {
        console.log('🏆 Battle result:', result);
        setBattleResult(result);
        setBattleNarrative(result.battleNarrative);
        setPhase('result');
      });

      socketService.onBattleError((error) => {
        console.error('❌ Battle error:', error);
        setError(error);
      });

      socketService.onOpponentDisconnected(() => {
        setError('Opponent disconnected');
      });

      // Join multiplayer with monster data
      socketService.joinMultiplayer({
        name: monster.name,
        description: monster.description,
        abilities: monster.abilities,
        image: monster.image,
        prompt: monster.prompt
      });

    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to multiplayer server');
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [monster]);

  const handleReady = () => {
    if (roomData) {
      socketService.playerReady(roomData.roomId);
      setPlayerReady(true);
    }
  };

  const handleNextNarrative = () => {
    if (currentNarrativeIndex < battleNarrative.length - 1) {
      setCurrentNarrativeIndex(currentNarrativeIndex + 1);
    }
  };

  const handleClose = () => {
    socketService.disconnect();
    onClose();
  };

  const renderPhase = () => {
    switch (phase) {
      case 'connecting':
        return (
          <div className="multiplayer-phase">
            <div className="loading-spinner"></div>
            <h2>Connecting to Battle Arena...</h2>
            <p>Preparing your monster for battle</p>
          </div>
        );

      case 'waiting':
        return (
          <div className="multiplayer-phase">
            <div className="waiting-animation">⚔️</div>
            <h2>Searching for Opponent...</h2>
            <p>Looking for another warrior to battle</p>
            <div className="monster-preview">
              <img src={monster.image} alt={monster.name} />
              <h3>{monster.name}</h3>
              <p>{monster.description}</p>
            </div>
          </div>
        );

      case 'room':
        return (
          <div className="multiplayer-phase">
            <h2>Battle Room</h2>
            <div className="battle-setup">
              <div className="player-section">
                <h3>Your Monster</h3>
                <div className="monster-card">
                  <img src={monster.image} alt={monster.name} />
                  <h4>{monster.name}</h4>
                  <div className="abilities">
                    {monster.abilities.map((ability, index) => (
                      <span key={index} className="ability">
                        {ability.name} ({ability.power})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ready-status">
                  {playerReady ? '✅ Ready!' : '⏳ Not Ready'}
                </div>
              </div>

              <div className="vs-section">
                <h2>VS</h2>
              </div>

              <div className="player-section">
                <h3>Opponent</h3>
                <div className="monster-card">
                  <img src={opponent?.monster.image} alt={opponent?.monster.name} />
                  <h4>{opponent?.monster.name}</h4>
                  <div className="abilities">
                    {opponent?.monster.abilities.map((ability, index) => (
                      <span key={index} className="ability">
                        {ability.name} ({ability.power})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ready-status">
                  {opponentReady ? '✅ Ready!' : '⏳ Not Ready'}
                </div>
              </div>
            </div>

            {!playerReady && (
              <button className="ready-button" onClick={handleReady}>
                Ready for Battle!
              </button>
            )}

            {playerReady && !opponentReady && (
              <p className="waiting-message">Waiting for opponent to ready up...</p>
            )}
          </div>
        );

      case 'battle':
        return (
          <div className="multiplayer-phase">
            <h2>Battle in Progress!</h2>
            <div className="battle-arena">
              <div className="battle-loading">
                <div className="battle-effects">⚔️⚡🔥</div>
                <p>AI Battle Master is analyzing the epic clash...</p>
              </div>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="multiplayer-phase">
            <h2>Battle Result</h2>
            <div className="battle-result">
              <div className="winner-announcement">
                <h3>
                  {battleResult.winner === 'player1' ? 
                    (roomData?.players[0]?.id === socketService.socket.id ? 'You Win!' : 'You Lose!') :
                    (roomData?.players[1]?.id === socketService.socket.id ? 'You Win!' : 'You Lose!')
                  }
                </h3>
                <p>{battleResult.victoryReason}</p>
              </div>

              <div className="battle-narrative">
                <h4>Battle Story</h4>
                <div className="narrative-content">
                  {battleNarrative.slice(0, currentNarrativeIndex + 1).map((narrative, index) => (
                    <p key={index} className="narrative-line">
                      <strong>Round {index + 1}:</strong> {narrative}
                    </p>
                  ))}
                </div>
                
                {currentNarrativeIndex < battleNarrative.length - 1 && (
                  <button className="next-button" onClick={handleNextNarrative}>
                    Next Round
                  </button>
                )}
              </div>

              <div className="final-stats">
                <h4>Final Stats</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span>{battleResult.monsters.player1.name} HP:</span>
                    <span>{battleResult.finalStats.monster1HP}</span>
                  </div>
                  <div className="stat-item">
                    <span>{battleResult.monsters.player2.name} HP:</span>
                    <span>{battleResult.finalStats.monster2HP}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="multiplayer-overlay">
      <div className="multiplayer-modal glass">
        <button className="close-button" onClick={handleClose}>×</button>
        
        {error ? (
          <div className="error-state">
            <h2>Connection Error</h2>
            <p>{error}</p>
            <button className="retry-button" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : (
          renderPhase()
        )}
      </div>
    </div>
  );
};

export default Multiplayer; 
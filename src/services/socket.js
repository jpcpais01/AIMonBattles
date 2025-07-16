import io from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3002';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (this.socket) {
      return this.socket;
    }

    console.log('🔌 Connecting to multiplayer server...');
    
    this.socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to multiplayer server!');
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from multiplayer server');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join multiplayer with monster data
  joinMultiplayer(monsterData) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    
    console.log('🎯 Joining multiplayer with monster:', monsterData.name);
    this.socket.emit('joinMultiplayer', { monster: monsterData });
  }

  // Mark player as ready for battle
  playerReady(roomId) {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }
    
    console.log('✅ Marking player as ready for battle');
    this.socket.emit('playerReady', roomId);
  }

  // Event listeners
  onWaitingForOpponent(callback) {
    if (this.socket) {
      this.socket.on('waitingForOpponent', callback);
    }
  }

  onRoomJoined(callback) {
    if (this.socket) {
      this.socket.on('roomJoined', callback);
    }
  }

  onPlayerReadyUpdate(callback) {
    if (this.socket) {
      this.socket.on('playerReadyUpdate', callback);
    }
  }

  onBattleStarted(callback) {
    if (this.socket) {
      this.socket.on('battleStarted', callback);
    }
  }

  onBattleResult(callback) {
    if (this.socket) {
      this.socket.on('battleResult', callback);
    }
  }

  onBattleError(callback) {
    if (this.socket) {
      this.socket.on('battleError', callback);
    }
  }

  onOpponentDisconnected(callback) {
    if (this.socket) {
      this.socket.on('opponentDisconnected', callback);
    }
  }

  // Remove event listeners
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Get connection status
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

// Export singleton instance
export default new SocketService(); 
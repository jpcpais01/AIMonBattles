const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());

// In-memory storage for rooms and battles
const rooms = new Map();
const waitingPlayers = [];

// Battle system using Groq AI
const analyzeBattle = async (monster1, monster2) => {
  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || 'your-groq-api-key-here';
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  console.log('🔥 Analyzing battle between monsters...');
  
  try {
    const systemPrompt = `You are a D&D-style battle master analyzing a Pokémon-style 1v1 monster battle. 

You will receive two monsters with their stats and abilities. Create an epic battle narrative and determine the winner.

Rules:
- Consider monster stats, abilities, and power levels
- Create a dramatic 3-round battle narrative
- Each round should have action and consequences
- Determine a winner based on strategy and stats
- Include HP changes and ability usage
- Make it exciting and engaging!

Output format:
{
  "battleNarrative": [
    "Round 1 description...",
    "Round 2 description...",
    "Round 3 description..."
  ],
  "winner": "player1" or "player2",
  "finalStats": {
    "monster1HP": number,
    "monster2HP": number
  },
  "victoryReason": "Brief explanation of why this monster won"
}

Output ONLY valid JSON, no other text.`;

    const userPrompt = `Battle Analysis:

MONSTER 1:
Name: ${monster1.name}
Description: ${monster1.description}
Abilities: ${monster1.abilities.map(a => `${a.name} (Power: ${a.power})`).join(', ')}
Generated from prompt: ${monster1.prompt}

MONSTER 2:
Name: ${monster2.name}
Description: ${monster2.description}
Abilities: ${monster2.abilities.map(a => `${a.name} (Power: ${a.power})`).join(', ')}
Generated from prompt: ${monster2.prompt}

Analyze this battle and return the result in the specified JSON format.`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const battleResult = JSON.parse(data.choices[0].message.content);
    
    console.log('✅ Battle analysis complete!');
    return battleResult;
    
  } catch (error) {
    console.error('❌ Battle analysis failed:', error);
    
    // Fallback battle logic
    const monster1Power = monster1.abilities.reduce((sum, ability) => sum + ability.power, 0);
    const monster2Power = monster2.abilities.reduce((sum, ability) => sum + ability.power, 0);
    
    const winner = monster1Power > monster2Power ? 'player1' : 'player2';
    
    return {
      battleNarrative: [
        `${monster1.name} and ${monster2.name} clash in an epic battle!`,
        `The creatures exchange powerful attacks, testing each other's strength.`,
        `After an intense struggle, ${winner === 'player1' ? monster1.name : monster2.name} emerges victorious!`
      ],
      winner,
      finalStats: {
        monster1HP: winner === 'player1' ? 25 : 0,
        monster2HP: winner === 'player2' ? 25 : 0
      },
      victoryReason: `${winner === 'player1' ? monster1.name : monster2.name} had superior combat abilities.`
    };
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🎮 Player connected: ${socket.id}`);

  // Player joins multiplayer queue
  socket.on('joinMultiplayer', (playerData) => {
    console.log(`🎯 Player ${socket.id} joining multiplayer with monster: ${playerData.monster.name}`);
    
    const player = {
      id: socket.id,
      monster: playerData.monster,
      ready: false
    };

    // Check if there's a waiting player
    if (waitingPlayers.length > 0) {
      // Match with waiting player
      const opponent = waitingPlayers.shift();
      const roomId = uuidv4();
      
      // Create room
      const room = {
        id: roomId,
        players: [opponent, player],
        status: 'waiting',
        battleResult: null
      };
      
      rooms.set(roomId, room);
      
      // Join both players to the room
      socket.join(roomId);
      io.sockets.sockets.get(opponent.id)?.join(roomId);
      
      // Notify both players
      io.to(roomId).emit('roomJoined', {
        roomId,
        players: room.players,
        yourPlayerId: socket.id
      });
      
      console.log(`🏟️ Room ${roomId} created with players: ${opponent.id} vs ${player.id}`);
      
    } else {
      // Add to waiting queue
      waitingPlayers.push(player);
      socket.emit('waitingForOpponent');
      console.log(`⏳ Player ${socket.id} waiting for opponent...`);
    }
  });

  // Player marks ready for battle
  socket.on('playerReady', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (player) {
      player.ready = true;
      console.log(`✅ Player ${socket.id} ready in room ${roomId}`);
      
      // Check if both players are ready
      if (room.players.every(p => p.ready)) {
        console.log(`🔥 Starting battle in room ${roomId}`);
        room.status = 'battling';
        
        // Start battle
        io.to(roomId).emit('battleStarted');
        
        // Analyze battle with AI
        setTimeout(async () => {
          try {
            const battleResult = await analyzeBattle(
              room.players[0].monster,
              room.players[1].monster
            );
            
            room.battleResult = battleResult;
            room.status = 'finished';
            
            // Send battle result to both players
            io.to(roomId).emit('battleResult', {
              ...battleResult,
              monsters: {
                player1: room.players[0].monster,
                player2: room.players[1].monster
              }
            });
            
            console.log(`🏆 Battle completed in room ${roomId}, winner: ${battleResult.winner}`);
            
          } catch (error) {
            console.error('Battle analysis error:', error);
            io.to(roomId).emit('battleError', 'Failed to analyze battle');
          }
        }, 2000); // 2 second delay for dramatic effect
      } else {
        // Notify room about ready status
        io.to(roomId).emit('playerReadyUpdate', {
          playerId: socket.id,
          ready: true
        });
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👋 Player disconnected: ${socket.id}`);
    
    // Remove from waiting queue
    const waitingIndex = waitingPlayers.findIndex(p => p.id === socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }
    
    // Handle room disconnection
    for (const [roomId, room] of rooms) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        // Notify opponent about disconnection
        io.to(roomId).emit('opponentDisconnected');
        
        // Clean up room
        rooms.delete(roomId);
        console.log(`🧹 Room ${roomId} cleaned up due to disconnection`);
        break;
      }
    }
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    rooms: rooms.size, 
    waitingPlayers: waitingPlayers.length,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`🚀 AI Monster Battles server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
}); 
// Groq API service for analyzing generated monster images
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || 'your-groq-api-key-here';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// NEW: Generate AI-powered prompt from selected cards
export const generateCreaturePrompt = async (selectedCards) => {
  try {
    console.log('🧠 Generating AI prompt from selected cards...');
    
    // Create a list of card texts grouped by type
    const cardsByType = selectedCards.reduce((acc, card) => {
      if (!acc[card.type]) acc[card.type] = [];
      acc[card.type].push(card.text);
      return acc;
    }, {});
    
    const cardList = selectedCards.map(card => `${card.text} (${card.type})`).join(', ');
    
    const systemPrompt = `You are a master AI image prompt creator. Your job is to take a list of trading card game elements and merge them into a single, powerful, concise prompt for AI image generation.

You must think about how these elements work together, then create a prompt that beautifully combines them into one coherent creature/scene concept.

Rules:
- Maximum 20 words in the final prompt
- Focus on the most important visual elements
- Merge concepts naturally and creatively
- Make it vivid and specific
- No generic terms like "digital art" or "high quality"
- Focus on the creature and its key characteristics
- If there are multiple creatures, mix them into one creature that displays all the characteristics of both creatures

Output format:
First, show a brief thinking process (2-3 sentences max), then output the final prompt wrapped in <prompt> tags.

Example input: Ancient Dragon (creature), Fire Elemental (attribute), Lightning Strike (power), Volcanic Cavern (environment)
Example output: 
I need to combine an ancient dragon with fire/lightning elements in a volcanic setting etc etc. The key visual elements are the dragon, dual fire/lightning powers, and the volcanic environment etc etc wtv.
<prompt>Ancient fire-lightning dragon breathing dual elements in molten volcanic cavern depths</prompt>`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Create a concise AI image prompt from these trading card elements: ${cardList}`
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, response.statusText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';
    
    console.log('🤖 AI Response:', aiResponse);
    
    // Extract prompt from <prompt> tags
    const promptMatch = aiResponse.match(/<prompt>(.*?)<\/prompt>/s);
    if (promptMatch && promptMatch[1]) {
      const extractedPrompt = promptMatch[1].trim();
      console.log('✅ Generated AI prompt:', extractedPrompt);
      return extractedPrompt;
    } else {
      console.warn('⚠️ No prompt tags found, using fallback parsing');
      // Fallback: try to extract the last sentence or use the whole response
      const lines = aiResponse.split('\n').filter(line => line.trim());
      const lastLine = lines[lines.length - 1];
      return lastLine.trim() || 'Epic fantasy creature with mystical powers';
    }
    
  } catch (error) {
    console.error('Error generating AI prompt:', error);
    
    // Fallback to simple card concatenation
    const cardTexts = selectedCards.map(card => card.text);
    const fallbackPrompt = cardTexts.slice(0, 3).join(' ') + ' creature';
    console.log('🔄 Using fallback prompt:', fallbackPrompt);
    return fallbackPrompt;
  }
};

export const analyzeMonsterImage = async (imageUrl, prompt) => {
  try {
    console.log('🧠 Analyzing monster image with Groq AI...');
    
    const systemPrompt = `You are a TCG (Trading Card Game) monster analyzer. Your job is to analyze the generated monster image and the prompt description to create compelling monster stats.

You must output EXACTLY in this format with NO additional text:

Monster Name: [Creative name based on the image and prompt]
Small description: [1 sentence about the monster's lore, very short]
Number of Abilities: [1 or 2]
Ability 1 Name and Power: [Ability name] - [Power level 1-20]
Ability 2 Name and Power: [Ability name] - [Power level 1-20] OR None

Rules:
- Monster name should be creative and fitting
- Description is actually the lore of the monster, should be engaging and match the visual
- Abilities should be thematic and balanced
- Power levels should be between 1-20
- If less than 2 abilities, use "None" for unused slots
- Be creative but stay true to the image and prompt`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Using available model
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Please analyze this monster based on the prompt: "${prompt}". Create compelling TCG stats for this creature.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('Groq API error:', response.status, response.statusText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';
    
    console.log('🤖 AI Response:', aiResponse);
    
    // Parse the structured response
    const stats = parseMonsterStats(aiResponse);
    console.log('✅ Parsed monster stats:', stats);
    
    return stats;
    
  } catch (error) {
    console.error('Error analyzing monster image:', error);
    
    // Fallback stats
    return {
      name: 'Mysterious Creature',
      description: 'A powerful being born from mystical card energies.',
      abilities: [
        { name: 'Primal Strike', power: 12 },
        { name: 'Energy Burst', power: 8 },
        { name: 'None', power: 0 }
      ]
    };
  }
};

const parseMonsterStats = (aiResponse) => {
  try {
    const lines = aiResponse.split('\n').filter(line => line.trim());
    
    let name = 'Unknown Monster';
    let description = 'A mysterious creature.';
    let abilities = [];
    
    lines.forEach(line => {
      if (line.includes('Monster Name:')) {
        name = line.split('Monster Name:')[1].trim();
      } else if (line.includes('Small description:')) {
        description = line.split('Small description:')[1].trim();
      } else if (line.includes('Ability') && line.includes('Name and Power:')) {
        const abilityText = line.split('Name and Power:')[1].trim();
        if (abilityText.toLowerCase() !== 'none') {
          const parts = abilityText.split(' - ');
          if (parts.length >= 2) {
            const abilityName = parts[0].trim();
            const powerStr = parts[1].trim();
            const power = parseInt(powerStr) || Math.floor(Math.random() * 15) + 5;
            abilities.push({ name: abilityName, power: power });
          }
        }
      }
    });
    
    // Ensure we have at least 1 ability
    if (abilities.length === 0) {
      abilities.push({ name: 'Basic Attack', power: 10 });
    }
    
    // Pad to 3 abilities with None
    while (abilities.length < 3) {
      abilities.push({ name: 'None', power: 0 });
    }
    
    return { name, description, abilities };
  } catch (error) {
    console.error('Error parsing monster stats:', error);
    return {
      name: 'Mysterious Creature',
      description: 'A powerful being born from mystical energies.',
      abilities: [
        { name: 'Primal Strike', power: 12 },
        { name: 'Energy Burst', power: 8 },
        { name: 'None', power: 0 }
      ]
    };
  }
};

export default { analyzeMonsterImage }; 
// Hugging Face Inference API with authentication
import { generateCreaturePrompt } from './groq';

const HF_API_URL = 'https://api-inference.huggingface.co/models/';

// IMPORTANT: Get your API key from https://huggingface.co/settings/tokens
// You need to set this in your environment or replace with your actual key
const HF_API_KEY = process.env.REACT_APP_HF_API_KEY || 'YOUR_HF_API_KEY_HERE';

// List of working image generation models (updated 2024)
const IMAGE_MODELS = [
  'stabilityai/stable-diffusion-xl-base-1.0',
  'CompVis/stable-diffusion-v1-4',
  'Lykon/DreamShaper',
  'wavymulder/Analog-Diffusion',
  'nitrosocke/Arcane-Diffusion',
  'prompthero/openjourney'
];

// Get a random model for variety
const getRandomModel = () => {
  return IMAGE_MODELS[Math.floor(Math.random() * IMAGE_MODELS.length)];
};

// Real Hugging Face API call
const callHuggingFaceAPI = async (prompt, model, retries = 3) => {
  const url = `${HF_API_URL}${model}`;
  
  console.log(`🤖 Calling Hugging Face API: ${model}`);
  console.log(`📝 Prompt: ${prompt}`);
  
  const headers = {
    'Authorization': `Bearer ${HF_API_KEY}`,
    'Content-Type': 'application/json',
  };
  
  const body = JSON.stringify({
    inputs: prompt,
    parameters: {
      num_inference_steps: 20,
      guidance_scale: 7.5,
      width: 512,
      height: 512,
    },
    options: {
      wait_for_model: true,
      use_cache: false
    }
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });
    
    console.log(`📡 Response status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key! Please check your Hugging Face API key.');
      }
      if (response.status === 402) {
        throw new Error('Payment Required! Your Hugging Face API key has reached its quota or billing limit. Please check your account at https://huggingface.co/settings/billing');
      }
      if (response.status === 503) {
        const errorText = await response.text();
        if (errorText.includes('loading') && retries > 0) {
          console.log(`⏳ Model loading, waiting 10 seconds... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 10000));
          return callHuggingFaceAPI(prompt, model, retries - 1);
        }
        throw new Error(`Model unavailable: ${errorText}`);
      }
      if (response.status === 404) {
        throw new Error(`Model not found: ${model}`);
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error('Empty response from API');
    }
    
    const imageUrl = URL.createObjectURL(blob);
    console.log('✅ Successfully generated real AI image!');
    return imageUrl;
    
  } catch (error) {
    console.error(`❌ API call failed:`, error);
    throw error;
  }
};

// Main function to generate image using REAL Hugging Face API
export const generateImage = async (prompt, selectedCards = []) => {
  console.log(`🚀 Generating REAL AI image for prompt: ${prompt}`);
  console.log('Selected cards:', selectedCards);
  
  // Check if API key is configured
  if (!HF_API_KEY || HF_API_KEY === 'YOUR_HF_API_KEY_HERE') {
    throw new Error('⚠️  Hugging Face API key not configured! Please set your API key.');
  }
  
  // Try multiple models in case one fails
  let lastError;
  for (let attempt = 0; attempt < IMAGE_MODELS.length; attempt++) {
    const model = IMAGE_MODELS[attempt]; // Try models in order for better debugging
    console.log(`🎯 Attempt ${attempt + 1}: Trying model ${model}`);
    
    try {
      const imageUrl = await callHuggingFaceAPI(prompt, model);
      console.log(`🎉 SUCCESS! Generated real AI image using ${model}`);
      return imageUrl;
    } catch (error) {
      console.log(`❌ Model ${model} failed: ${error.message}`);
      lastError = error;
      
      // If it's an auth error, don't retry
      if (error.message.includes('Invalid API key')) {
        throw error;
      }
      
      // Wait before trying next model
      if (attempt < IMAGE_MODELS.length - 1) {
        console.log('⏳ Waiting 3 seconds before trying next model...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All models failed to generate image');
};

// AI-powered prompt generation using Groq API
export const buildPrompt = async (selectedCards) => {
  if (selectedCards.length === 0) return '';
  
  try {
    console.log('🤖 Using AI-powered prompt generation...');
    
    // Use Groq AI to generate a smart, concise prompt
    const aiPrompt = await generateCreaturePrompt(selectedCards);
    
    // Add quality enhancers for better AI image generation
    const enhancedPrompt = `${aiPrompt}, highly detailed, digital art, fantasy, epic, dramatic lighting, masterpiece, 8k resolution`;
    
    console.log('✅ Final enhanced prompt:', enhancedPrompt);
    return enhancedPrompt;
    
  } catch (error) {
    console.error('❌ AI prompt generation failed, using fallback:', error);
    
    // Fallback to simple card concatenation
    const cardTexts = selectedCards.map(card => card.text);
    const fallbackPrompt = cardTexts.slice(0, 3).join(' ') + ' creature, highly detailed, digital art, fantasy, epic, dramatic lighting, masterpiece, 8k resolution';
    
    console.log('🔄 Using fallback prompt:', fallbackPrompt);
    return fallbackPrompt;
  }
};

// Fallback function for when generation fails
export const generatePlaceholderImage = (prompt) => {
  // Create a simple placeholder with the prompt text
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add border to show it's a placeholder
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 508, 508);
  
  // Add "AI GENERATION FAILED" text at top
  ctx.fillStyle = '#ff6b6b';
  ctx.font = 'bold 20px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI GENERATION FAILED', 256, 50);
  
  // Add API key message
  ctx.fillStyle = '#ffaa44';
  ctx.font = 'bold 16px Inter';
  ctx.fillText('NEED HUGGING FACE API KEY', 256, 80);
  
  // Add instructions
  ctx.fillStyle = '#00ffff';
  ctx.font = '14px Inter';
  ctx.fillText('Get your free API key at:', 256, 110);
  ctx.fillText('huggingface.co/settings/tokens', 256, 130);
  
  // Add prompt text
  ctx.fillStyle = 'white';
  ctx.font = '14px Inter';
  ctx.fillText('Your prompt was:', 256, 170);
  
  // Word wrap for long prompts
  const words = prompt.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 450 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  const lineHeight = 20;
  const startY = 200;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, 256, startY + index * lineHeight);
  });
  
  // Add instruction text at bottom
  ctx.fillStyle = '#888';
  ctx.font = '12px Inter';
  ctx.fillText('Configure your API key to generate real AI images!', 256, 480);
  
  return canvas.toDataURL();
}; 
# AI Monster Battles 🐲⚡

A Progressive Web App (PWA) that lets you create unique AI-generated creatures through a Tinder-like card swiping interface!

## ✨ Features

- **Tinder-like Swipe Interface**: Smooth gesture-based swiping with touch support
- **AI Image Generation**: Uses Hugging Face API to generate unique creatures
- **Progressive Web App**: Installable on mobile devices with offline capabilities
- **Responsive Design**: Optimized for all screen sizes, especially mobile
- **Futuristic UI**: Glass morphism effects with a stunning Frutiger Aero aesthetic
- **60+ Unique Cards**: Across 6 categories (creatures, environments, powers, styles, attributes, moods)

## 🚀 How to Play

1. **Swipe Cards**: Swipe right to select cards, left to skip
2. **Build Your Prompt**: Collect up to 10 cards to create your creature
3. **Generate**: Watch as AI creates your unique creature from your selections
4. **Download & Share**: Save your creation and start again!

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aiMonBattles
```

2. Install dependencies:
```bash
npm install
```

3. **Configure Hugging Face API (REQUIRED for AI image generation):**
   - Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Create a new token (read access is sufficient)
   - Copy the token

4. **Set up environment variables:**
   - Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```
   - Edit `.env` and replace `your_hugging_face_api_key_here` with your actual API key:
   ```
   REACT_APP_HF_API_KEY=hf_your_actual_api_key_here
   ```

5. Start the development server:
```bash
npm start
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 PWA Installation

On mobile devices, you can install this as a native app:
- **iOS**: Tap the share button and select "Add to Home Screen"
- **Android**: Tap the menu and select "Add to Home Screen" or "Install App"

## 🎨 Technology Stack

- **React**: Frontend framework
- **PWA**: Progressive Web App standards
- **Hugging Face API**: AI image generation
- **React Spring**: Smooth animations
- **React Use Gesture**: Touch and swipe handling
- **CSS3**: Glass morphism and responsive design

## 🌟 Features in Detail

### Card System
- 60 unique cards across 6 categories
- Each card has type-specific colors and emojis
- Dynamic card shuffling for variety

### Swipe Interface
- Smooth gesture-based swiping
- Visual feedback with rotation and scale effects
- Touch-friendly mobile controls
- Swipe indicators for user guidance

### AI Generation
- Multiple Hugging Face models for variety
- Intelligent prompt building from selected cards
- Fallback system with retry logic
- Offline placeholder generation

### Progressive Web App
- App manifest for mobile installation
- Service worker for offline functionality
- Responsive design for all devices
- Native app-like experience

## 🎯 API Integration

This app uses the **REAL Hugging Face Inference API** with multiple AI models:
- `runwayml/stable-diffusion-v1-5`
- `stabilityai/stable-diffusion-2-1`
- `CompVis/stable-diffusion-v1-4`
- `prompthero/openjourney-v4`
- `dreamlike-art/dreamlike-diffusion-1.0`
- `Lykon/DreamShaper`
- `wavymulder/Analog-Diffusion`

**⚠️ API Key Required**: You need a free Hugging Face account and API token!

### How to get your API key:
1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new token (read access is sufficient)
3. Copy the token and add it to your `.env` file

### Features:
- **Multiple model fallback**: If one model fails, tries another
- **Smart retry logic**: Handles loading states and temporary failures
- **Real AI generation**: Actual Stable Diffusion and other models
- **Optimized prompts**: Enhanced prompts for better results

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── SwipeCard.js    # Swipeable card component
│   ├── ProgressBar.js  # Progress tracking
│   └── GeneratedImage.js # Result display
├── data/               # Card data and utilities
├── services/           # API integration
└── App.js             # Main application
```

### Available Scripts
- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🎨 UI/UX Design

The app features a futuristic Frutiger Aero aesthetic with:
- Glass morphism effects
- Smooth animations and transitions
- Responsive design patterns
- Touch-friendly interface elements
- Loading states and visual feedback

## 📱 Mobile Optimization

- Touch-friendly swipe gestures
- Responsive card layouts
- Mobile-first design approach
- PWA installation capabilities
- Offline functionality

## 🌐 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers
- Touch device optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Hugging Face for providing free AI models
- React team for the amazing framework
- The open-source community for inspiration

---

**Created with ❤️ using React & Hugging Face AI**

Swipe, create, and let your imagination run wild! 🎨✨ 
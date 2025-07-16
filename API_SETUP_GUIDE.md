# 🚀 Quick API Setup Guide

## Get Your FREE Hugging Face API Key

### Step 1: Create Account (if you don't have one)
- Go to [https://huggingface.co/join](https://huggingface.co/join)
- Sign up for a free account
- Verify your email

### Step 2: Generate API Token
- Visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Click "New token"
- Name it something like "AI Monster Battles"
- Select "Read" access (sufficient for image generation)
- Click "Generate a token"
- **COPY THE TOKEN** - you won't see it again!

### Step 3: Configure Your App
1. **Copy the environment file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the .env file:**
   Open `.env` and replace the placeholder:
   ```
   REACT_APP_HF_API_KEY=hf_your_actual_token_here
   ```

3. **Restart your development server:**
   ```bash
   npm start
   ```

## 🎉 You're Ready!

Now when you generate creatures in the app, you'll get **REAL AI-generated images** using:
- Stable Diffusion v1.5
- Stable Diffusion v2.1
- OpenJourney v4
- DreamShaper
- And more!

## 💡 Tips

- **Free Tier**: Hugging Face gives you generous free usage
- **Multiple Models**: App automatically tries different models if one fails
- **Smart Retry**: Handles temporary API issues automatically
- **Secure**: API key is stored in environment variables (not in code)

## 🔧 Troubleshooting

**"Invalid API key" error?**
- Double-check your token is copied correctly
- Make sure it starts with `hf_`
- Verify the token has "Read" permissions

**Models taking too long?**
- First time loading a model can take 10-20 seconds
- App will automatically wait and retry

**Still not working?**
- Check browser console for detailed error messages
- Make sure `.env` file is in the project root
- Restart your development server after adding the key

---

**Need help?** Check the console logs - they have detailed status messages with emojis! 🤖📡✅ 
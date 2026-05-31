# JARVIS - AI Voice Assistant (Next.js Edition)

A modern web-based implementation of JARVIS - your personal AI voice assistant. Built with Next.js and ready for deployment on Vercel.

## 🌟 Features

- 🎤 **Voice Input**: Record audio directly from your browser
- 📝 **Speech-to-Text**: Powered by Deepgram API
- 🤖 **AI Responses**: Intelligent responses from OpenAI GPT
- 🔊 **Text-to-Speech**: Natural voice synthesis with ElevenLabs
- 💬 **Conversation Memory**: Maintains context across messages
- 📱 **Responsive Design**: Works on desktop and mobile
- ⚡ **Real-time Processing**: Instant transcription and generation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- API keys for:
  - [OpenAI](https://platform.openai.com/api-keys) (GPT)
  - [Deepgram](https://console.deepgram.com) (Speech-to-Text)
  - [ElevenLabs](https://elevenlabs.io) (Text-to-Speech)

### Installation

1. **Clone/Fork this repository**

```bash
git clone https://github.com/progmeprathm/jarvis12.git
cd jarvis12
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DEEPGRAM_API_KEY=your_deepgram_key_here
OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment on Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial Next.js JARVIS setup"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository (`jarvis12`)
4. Add environment variables in Vercel dashboard:
   - `DEEPGRAM_API_KEY`
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `JARVIS_SYSTEM_PROMPT` (optional)
   - `OPENAI_MODEL` (optional, default: gpt-3.5-turbo)
   - `ELEVENLABS_VOICE_ID` (optional, default: Adam)
5. Click "Deploy"

### Step 3: Configure for Production

Add these environment variables in Vercel project settings:

- `DEEPGRAM_API_KEY`: Your Deepgram API key
- `OPENAI_API_KEY`: Your OpenAI API key  
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key

## 🔧 API Routes

### `POST /api/transcribe`

Transcribes audio to text using Deepgram.

**Request:**
- FormData with `audio` file (WAV format)

**Response:**
```json
{
  "text": "transcribed text here"
}
```

### `POST /api/chat`

Generates AI response using OpenAI GPT.

**Request:**
```json
{
  "userMessage": "user's message",
  "conversationContext": "conversation history"
}
```

**Response:**
```json
{
  "response": "jarvis's response"
}
```

### `POST /api/synthesize`

Converts text to speech using ElevenLabs.

**Request:**
```json
{
  "text": "text to convert to speech"
}
```

**Response:**
- Audio stream (audio/mpeg)

## 🎨 Customization

### Change JARVIS Personality

Edit `.env.local`:

```env
JARVIS_SYSTEM_PROMPT=You are a helpful coding assistant. Be concise and technical.
```

### Change Voice

Available ElevenLabs voices: Adam, Bella, Charlie, Dora, etc.

```env
ELEVENLABS_VOICE_ID=Bella
```

### Use Different GPT Model

```env
OPENAI_MODEL=gpt-4
```

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts    # Speech-to-text
│   │   ├── chat/route.ts          # AI responses
│   │   └── synthesize/route.ts    # Text-to-speech
│   ├── page.tsx                   # Main UI
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── .env.example                   # Environment template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.js                 # Next.js config
└── vercel.json                    # Vercel config
```

## 🔐 Security Notes

- Never commit `.env.local` with real API keys
- Use Vercel's environment variables for production
- Keep API keys secure and rotate them regularly
- Monitor API usage to control costs

## 💰 Cost Considerations

- **Deepgram**: ~$0.0043 per minute of audio
- **OpenAI**: ~$0.0005 per prompt (GPT-3.5-turbo)
- **ElevenLabs**: ~$0.30 per 1K characters

Estimate: ~$0.03 per conversation

## 🐛 Troubleshooting

### Microphone Access Denied
- Check browser permissions
- Use HTTPS (required for microphone access)
- On localhost, HTTP works fine

### Audio Not Playing
- Check browser audio permissions
- Ensure ElevenLabs API key is valid
- Check browser console for errors

### API Errors
- Verify all environment variables are set
- Check API key validity in respective dashboards
- Monitor API usage and rate limits

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Deepgram API Docs](https://developers.deepgram.com/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## 📝 License

GPL-3.0 (matching original JARVIS project)

## 🙏 Credits

Based on the original [JARVIS](https://github.com/AlexandreSajus/JARVIS) by [Alexandre Sajus](https://github.com/AlexandreSajus)

---

**Ready to deploy?** Push to GitHub and connect to Vercel! 🚀

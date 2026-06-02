# JARVIS - AI Voice Assistant (Next.js Edition)

A premium web-based implementation of JARVIS—your personal AI assistant. Built with Next.js, featuring an Apple Glass inspired design, multi-modal features, and optimized for free-tier cloud deployment on Vercel.

## 🌟 Features

- 🕶️ **Apple Glass Inspired UI**: A gorgeous, dark-mode glassmorphic user interface complete with interactive fluid ambient glow effects, responsive sizing, and micro-interactions.
- 🎤 **Voice Input**: Record audio directly from your browser with status logs and a dynamic, animated audio waveform.
- 📝 **Speech-to-Text (STT)**: Fast and reliable transcription powered by the **Google Cloud Speech-to-Text API** (optimized for `WEBM_OPUS` audio).
- 🤖 **Multimodal AI Responses**: Intelligent reasoning powered by the **Groq API** running the advanced multimodal **Llama 4 Scout** model (`meta-llama/llama-4-scout-17b-16e-instruct`).
- 📷 **Image Support**: Upload or drag-and-drop images for the AI to reference, describe, and answer queries about.
- 💬 **Hybrid Text Chat**: Seamlessly switch between voice messages and standard text input.
- 🔊 **Text-to-Speech (TTS)**: Realistic, high-fidelity voice synthesis powered by **Google Cloud Text-to-Speech** (using high-quality `en-US-Neural2-A` voices).
- ♿ **Accessibility Tools**: Integrated controls designed for ease of use:
  - **Adjustable Font Sizes**: Instantly scale message font sizes (Normal `A`, Medium `A+`, Large `A++`).
  - **Speech Speed Control**: Change the speaking rate of JARVIS responses (Slower `0.8x`, Normal `1.0x`, Faster `1.2x`).
  - **Mute Mode**: Toggle speech synthesis off to use JARVIS silently and conserve API usage.
- 📼 **Interactive Audio Player**: Replay responses, pause playback, view estimated durations, and copy response texts with a click.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- API keys for:
  - **[Groq](https://console.groq.com)** (Free Tier LLM)
  - **[Google Cloud Console](https://console.cloud.google.com)** (Free Tier Speech-to-Text and Text-to-Speech)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/progmeprathm/jarvis12.git
cd jarvis12
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Groq API - Free LLM (https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Google Cloud Text-to-Speech (https://cloud.google.com/text-to-speech)
GOOGLE_TTS_API_KEY=your_google_tts_api_key_here

# Google Cloud Speech-to-Text (https://cloud.google.com/speech-to-text)
GOOGLE_STT_API_KEY=your_google_stt_api_key_here
GOOGLE_PROJECT_ID=your_google_project_id_here

# Optional: JARVIS System Prompt
JARVIS_SYSTEM_PROMPT=You are Jarvis, a witty and helpful AI assistant. Keep your answers to 1-2 short sentences.
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment on Vercel

### Step 1: Push to GitHub

Ensure all your local changes are committed and pushed:

```bash
git add .
git commit -m "Configure JARVIS with Apple Glass UI and Groq + Google APIs"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **"New Project"**.
3. Import your GitHub repository (`jarvis12`).
4. Add the following **Environment Variables** in the Vercel dashboard:
   - `GROQ_API_KEY`
   - `GOOGLE_STT_API_KEY`
   - `GOOGLE_TTS_API_KEY`
   - `GOOGLE_PROJECT_ID`
   - `JARVIS_SYSTEM_PROMPT` (optional)
5. Click **"Deploy"**.

---

## 🔧 API Routes

### `POST /api/transcribe`

Transcribes WebM/Opus audio to text using Google Cloud Speech-to-Text.

**Request:**
- `FormData` containing the `audio` file.

**Response:**
```json
{
  "text": "transcribed text here"
}
```

### `POST /api/chat`

Generates AI responses (supporting text and image modalities) using Groq.

**Request:**
```json
{
  "userMessage": "user's message",
  "image": "data:image/png;base64,... (optional base64 image)"
}
```

**Response:**
```json
{
  "response": "jarvis's response"
}
```

### `POST /api/synthesize`

Converts response text to an audio stream using Google Cloud Text-to-Speech.

**Request:**
```json
{
  "text": "text to convert to speech",
  "speed": 1.0
}
```

**Response:**
- Audio stream (`audio/mpeg`)

---

## 🎨 Customization

### Change JARVIS Personality
Modify `JARVIS_SYSTEM_PROMPT` in `.env.local` or Vercel Settings to change how JARVIS behaves:
```env
JARVIS_SYSTEM_PROMPT=You are a helpful coding assistant. Be concise and technical.
```

### Change Voice Model
The TTS route (`app/api/synthesize/route.ts`) is currently configured to use `en-US-Neural2-A`. You can edit this route to select a different Google Cloud TTS voice model.

---

## 📂 Project Structure

```
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts    # Google Cloud Speech-to-Text API
│   │   ├── chat/route.ts          # Groq Llama 4 Scout Chat API (multimodal)
│   │   └── synthesize/route.ts    # Google Cloud Text-to-Speech API
│   ├── page.tsx                   # Apple Glass UI & Interactive Logic
│   ├── layout.tsx                 # Next.js Root Layout
│   └── globals.css                # Glassmorphic themes, animations & styling
├── .env.example                   # Environment configuration template
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── next.config.js                 # Next.js config
└── vercel.json                    # Vercel deployment config
```

---

## 🔐 Security Notes

- Never commit `.env.local` or any files containing private keys to public repositories.
- Restrict your Google Cloud API keys if possible to prevent misuse or budget overruns.
- Use Vercel's environment variables dashboard for production secrets.

---

## 💰 Cost Considerations

Since this setup utilizes free cloud tiers:
- **Groq API**: 100% Free (Developer rate limits apply).
- **Google Cloud Speech-to-Text**: 60 minutes/month free.
- **Google Cloud Text-to-Speech**: 4 million characters/month free.

If usage remains within the free tier, running JARVIS is completely **free**!

---

## 🐛 Troubleshooting

### Microphone Access Denied
- Check browser permissions for mic access.
- Secure context (HTTPS) is required for microphone access. While `localhost` works fine over HTTP, production deployments (like Vercel) must use HTTPS.

### Audio Not Playing
- Check browser audio configurations or if the tab is muted.
- Ensure `GOOGLE_TTS_API_KEY` is configured correctly.
- Verify if **Mute** mode is toggled on in the UI header.

### API Errors
- Verify all environment variables are correctly populated in `.env.local` (local) or Vercel Settings (production).
- Check your Google Cloud console to verify that the **Cloud Speech-to-Text** and **Cloud Text-to-Speech** APIs are enabled.

---

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Google Cloud Speech-to-Text Docs](https://cloud.google.com/speech-to-text/docs)
- [Google Cloud Text-to-Speech Docs](https://cloud.google.com/text-to-speech/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

## 📝 License

GPL-3.0 (matching original JARVIS project)

## 🙏 Credits

Based on the original [JARVIS](https://github.com/AlexandreSajus/JARVIS) by [Alexandre Sajus](https://github.com/AlexandreSajus).

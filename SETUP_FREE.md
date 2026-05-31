# JARVIS - 100% Free & Open Source Setup Guide

This version uses completely **free and open-source** tools:
- 🎤 **Whisper** (OpenAI) - Speech-to-Text
- 🧠 **Ollama** (Llama 2) - Local LLM
- 🔊 **Coqui TTS** - Text-to-Speech

---

## 📋 Requirements

- Node.js 18+
- Python 3.8+
- 8GB RAM minimum (16GB recommended)
- Good internet (for initial downloads only)

---

## ⚙️ Step 1: Install Whisper

Whisper handles speech-to-text. Install via pip:

```bash
# macOS / Linux
pip install openai-whisper

# Verify installation
whisper --help

# Pre-download a model (first run takes time)
whisper path/to/any/audio.wav --model base
```

**Available models**: `tiny`, `base` (recommended), `small`, `medium`, `large`
- Larger = better accuracy, slower
- `base` is a good balance (~140MB)

---

## ⚙️ Step 2: Install Ollama

Ollama runs local LLMs without internet API calls:

### **macOS / Windows / Linux**

1. Download from: https://ollama.ai
2. Install the application
3. Open terminal and run:

```bash
# Download and run Llama 2 (4.7GB - first download takes 10-15 min)
ollama pull llama2

# Start Ollama server
ollama serve

# In another terminal, test it
curl http://localhost:11434/api/chat -d '{
  "model": "llama2",
  "messages": [{"role": "user", "content": "Say hello"}],
  "stream": false
}'
```

**Keep Ollama running** in background while using JARVIS.

**Alternative lighter models:**
```bash
ollama pull mistral        # Smaller, faster
ollama pull neural-chat    # Lightweight
ollama pull phi            # Very light
```

---

## ⚙️ Step 3: Install Coqui TTS

Coqui TTS generates speech from text:

```bash
# Install Coqui TTS
pip install TTS

# Start TTS server
tts_server --model_name tts_models/en/ljspeech/tacotron2-DDC --port 5002

# Test it (in another terminal)
curl "http://localhost:5002/api/tts?text=hello%20world"
```

**Keep TTS server running** in another terminal while using JARVIS.

**Alternative models** (if first one is slow):
```bash
# Lightweight
tts_server --model_name tts_models/en/ljspeech/glow-tts --port 5002

# Very fast
tts_server --model_name tts_models/en/ljspeech/fastpitch --port 5002
```

---

## 🚀 Step 4: Run JARVIS

### Setup Next.js

```bash
# Clone and setup
git clone https://github.com/progmeprathm/jarvis12.git
cd jarvis12

# Install npm dependencies
npm install

# Copy environment config
cp .env.example .env.local

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser!

---

## 📊 Running Everything Together

**Open 3 terminals:**

### Terminal 1: Ollama
```bash
ollama serve
```
Output: `Listening on 127.0.0.1:11434`

### Terminal 2: Coqui TTS
```bash
tts_server --model_name tts_models/en/ljspeech/tacotron2-DDC --port 5002
```
Output: `Running on http://0.0.0.0:5002`

### Terminal 3: JARVIS (Next.js)
```bash
cd jarvis12
npm run dev
```
Output: `Ready in XXXms`

Then visit: **http://localhost:3000**

---

## 🎤 How to Use

1. Click **"Start Recording"**
2. Speak into your microphone
3. Click **"Stop Recording"**
4. Watch the magic happen:
   - 📝 Whisper transcribes your speech
   - 🤖 Ollama generates a response
   - 🔊 Coqui TTS converts response to audio

---

## 🔧 Configuration

Edit `.env.local` to customize:

```env
# Ollama settings
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Whisper settings
WHISPER_MODEL=base              # tiny, base, small, medium, large

# Coqui TTS settings
COQUI_TTS_URL=http://localhost:5002

# JARVIS personality
JARVIS_SYSTEM_PROMPT=You are Jarvis, a witty and helpful AI assistant. Keep your answers to 1-2 short sentences.
```

---

## 💾 Storage Requirements

| Component | Size | Download Time |
|-----------|------|---------------|
| Whisper (base) | 140 MB | 2-5 min |
| Ollama Llama2 | 4.7 GB | 15-30 min |
| Coqui TTS | 200 MB | 5-10 min |
| **Total** | **~5 GB** | **~30 min** |

---

## ⚡ Performance Tips

### Faster Responses
1. Use smaller models:
   ```bash
   ollama pull mistral  # Faster than llama2
   ```

2. Use faster TTS:
   ```bash
   tts_server --model_name tts_models/en/ljspeech/glow-tts --port 5002
   ```

3. Use smaller Whisper model:
   ```env
   WHISPER_MODEL=tiny  # Fastest, but less accurate
   ```

### Better Accuracy
1. Use larger models (but slower):
   ```bash
   ollama pull neural-chat  # More coherent
   WHISPER_MODEL=small  # Better transcription
   ```

---

## 🐛 Troubleshooting

### "Ollama is not running"
```bash
# Make sure Ollama server is active
ollama serve
```

### "Whisper not found"
```bash
# Install Whisper
pip install openai-whisper
```

### "Coqui TTS not running"
```bash
# Start TTS server
tts_server --model_name tts_models/en/ljspeech/tacotron2-DDC --port 5002
```

### "Microphone permission denied"
- Check browser microphone permissions
- HTTPS required in production (HTTP OK for localhost)

### Slow responses
- Reduce model sizes (see Performance Tips above)
- Increase RAM
- Use GPU acceleration (requires CUDA setup)

---

## 📚 Resources

- [OpenAI Whisper](https://github.com/openai/whisper)
- [Ollama Documentation](https://ollama.ai)
- [Coqui TTS GitHub](https://github.com/coqui-ai/TTS)
- [Next.js Docs](https://nextjs.org/docs)

---

## 💰 Cost

**$0 - Completely Free!**

All components are open-source and run locally on your machine.

---

**Ready to run JARVIS locally? Start with the 3 terminals above!** 🚀

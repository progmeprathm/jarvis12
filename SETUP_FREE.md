# JARVIS - Local Running Guide (100% Free Cloud APIs)

This version of JARVIS runs locally on your machine but interfaces with **100% free cloud API tiers**:
- **Groq API** for AI reasoning (using multimodal Llama 4 Scout).
- **Google Cloud Speech-to-Text** for audio transcription.
- **Google Cloud Text-to-Speech** for speech synthesis.

Unlike previous versions, you **no longer** need to download heavy local models, run Python servers, or have large amounts of RAM. Setting up and running JARVIS locally takes less than 5 minutes!

---

## 📋 Prerequisites

- **Node.js 18+** installed on your system.
- A terminal of your choice.
- Internet connection (to access the APIs).
- API Keys (see step below).

---

## ⚙️ Step 1: Obtain Free API Keys

### 1. Groq API Key
1. Visit the [Groq Console](https://console.groq.com).
2. Sign up or log in.
3. Click on **API Keys** in the sidebar.
4. Click **Create API Key**, copy it, and save it.

### 2. Google Cloud API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project.
3. Search for and enable the following APIs:
   - **Cloud Speech-to-Text API**
   - **Cloud Text-to-Speech API**
4. Go to **APIs & Services > Credentials**.
5. Click **Create Credentials** and select **API Key**.
6. Copy the generated API key (it will be used for both STT and TTS).
7. Copy your Google Cloud project ID from the dashboard.

---

## 🚀 Step 2: Running JARVIS Locally

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/progmeprathm/jarvis12.git
   cd jarvis12
   npm install
   ```

2. **Configure environment variables:**
   Copy the example file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` in your editor and add your keys:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   GOOGLE_TTS_API_KEY=your_google_cloud_api_key_here
   GOOGLE_STT_API_KEY=your_google_cloud_api_key_here
   GOOGLE_PROJECT_ID=your_google_project_id_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🎙️ How to Use

1. **Voice Mode**:
   - Click **🎤 TAP TO SPEAK** to start recording.
   - Speak into your microphone.
   - Click **⏹️ TAP TO STOP** when done.
   - JARVIS will transcribe, think, and play back the audio response with an animated waveform.

2. **Text / Image Mode**:
   - Type a query in the message input box and click **Send**.
   - Click the **+** (Attach) button to upload an image, type your question, and submit to let Groq's Llama 4 Scout model analyze the image.

3. **Accessibility Controls**:
   - Change font size using **A**, **A+**, and **A++** buttons in the header.
   - Adjust speech synthesis speed (Slower, Normal, Faster).
   - Use the **Mute** button to silence speech responses and save API usage.

---

## 💰 Free Tier Usage Limits

The APIs used in this project have generous free tiers:

| Service | Free Tier Limit | Reset |
|---|---|---|
| **Groq API** | Free limits (per model) | Minutely/Daily |
| **Google Speech-to-Text** | 60 minutes of audio / month | Monthly |
| **Google Text-to-Speech** | 4 million characters / month | Monthly |

*Tip: Mute the speech response in the header if you are only chatting via text to prevent utilizing Google TTS characters.*

---

## 🐛 Troubleshooting

### Microphone Access Denied
- Ensure you have granted microphone permissions to your browser.
- Browser security policies allow HTTP microphone access only on `localhost`. For production, HTTPS is required.

### Google API Keys Not Working
- Make sure both the **Cloud Speech-to-Text API** and **Cloud Text-to-Speech API** are fully enabled in your Google Cloud Project console.
- Check if your API key has any restrictions that would block it from calling these APIs.

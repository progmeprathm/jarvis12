# JARVIS - Vercel Deployment Guide (Free Cloud APIs)

🚀 **Deploy your personal JARVIS assistant to Vercel with completely FREE cloud APIs!**

This guide outlines how to deploy the JARVIS web application, including its Apple Glass inspired UI, multi-modal features, and accessibility adjustments.

---

## 🎯 Architecture

Our deployment utilizes three core cloud services, all running on zero-cost free tiers:
- **Speech-to-Text**: Google Cloud Speech-to-Text (60 minutes/month free)
- **AI LLM**: Groq API (generous developer limits) running Llama 4 Scout for image and text inputs
- **Text-to-Speech**: Google Cloud Text-to-Speech (4 million characters/month free)

---

## 📋 Step 1: Obtain API Keys

### 1️⃣ Groq API Key
1. Go to [Groq Console](https://console.groq.com).
2. Sign up or log in to your account.
3. Select **API Keys** from the sidebar.
4. Click **Create API Key**, copy, and save it.

### 2️⃣ Google Cloud Credentials
1. Open the [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project or select an existing one.
3. In the search bar, look up and enable:
   - **Cloud Speech-to-Text API**
   - **Cloud Text-to-Speech API**
4. Navigate to **APIs & Services > Credentials**.
5. Click **Create Credentials** -> **API Key**.
6. Copy this API key. You will use it for both Speech-to-Text and Text-to-Speech.
7. Copy your Google Cloud project ID (found on the homepage dashboard).

---

## 🌐 Step 2: Deploy to Vercel

### Setup Repository
First, ensure your local repository changes are pushed to GitHub:

```bash
git add .
git commit -m "Configure JARVIS with Apple Glass UI and Groq + Google APIs"
git push origin main
```

### Deploy to Vercel Dashboard

1. Log in to [Vercel](https://vercel.com).
2. Click **New Project** on your dashboard.
3. Find your GitHub repository (`jarvis12`) and click **Import**.
4. Expand the **Environment Variables** section and add the following keys:
   
   | Key | Value | Description |
   |---|---|---|
   | `GROQ_API_KEY` | `gsk_...` | Your Groq API Key |
   | `GOOGLE_STT_API_KEY` | `AIzaSy...` | Your Google Cloud API Key |
   | `GOOGLE_TTS_API_KEY` | `AIzaSy...` | Your Google Cloud API Key |
   | `GOOGLE_PROJECT_ID` | `your-project-id` | Your Google Cloud Project ID |
   | `JARVIS_SYSTEM_PROMPT` | `You are Jarvis...` | (Optional) Custom system instructions for the AI |

5. Click **Deploy** and wait for the build to finish. Vercel will automatically provision a secure HTTPS domain for your live app!

---

## 📊 Free Tier Limits

| Service | Free Tier Allocation | Reset Period |
|---|---|---|
| **Groq LLM** | Standard developer tier limits | Minutely/Daily |
| **Google Speech-to-Text** | 60 minutes of transcribed audio | Monthly |
| **Google Text-to-Speech** | 4 million characters of synthesis | Monthly |

*Tip: You can use the **Mute** button in the header of the deployed web interface to run chats silently and preserve your Google Cloud TTS characters.*

---

## ⚡ Features Out-of-the-box

- **Secure by Default**: Vercel handles SSL certificates automatically, which is a hard requirement for browser microphone permissions.
- **Ultra-responsive**: Powered by Next.js edge routing and Groq's high-speed Llama inference engine.
- **Accessibility Friendly**: Includes options to scale text size, adjust voice playback speed, and mute output.

---

## 🆘 Troubleshooting

### "API Key Invalid"
- Check that the Google Cloud project has both the **Cloud Speech-to-Text** and **Cloud Text-to-Speech** APIs fully enabled.
- Verify your Groq API key is correct and not deactivated.

### "Microphone Permission Denied"
- Browsers only grant microphone access in secure contexts (HTTPS). When running on local networks or custom domains, make sure you are accessing the app via `https://`. (Default Vercel domains are HTTPS).

### "Quota Exceeded"
- You have reached the monthly limit of your Google Cloud APIs or Groq rate limits. You can monitor your usage inside their respective consoles.

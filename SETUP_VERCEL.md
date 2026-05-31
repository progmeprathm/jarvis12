# JARVIS - Vercel Deployment Guide (Free APIs)

🚀 **Deploy to Vercel with completely FREE APIs!**

## 🎯 Architecture

- **Speech-to-Text**: Google Cloud Speech-to-Text (60 min/month free)
- **AI LLM**: Groq API (unlimited free tier)
- **Text-to-Speech**: Google Cloud Text-to-Speech (4M chars/month free)

---

## 📋 Step 1: Get Free API Keys

### 1️⃣ **Groq API** (Free LLM)

1. Go to: https://console.groq.com
2. Sign up (free account)
3. Navigate to **API Keys**
4. Create a new API key
5. Copy and save as `GROQ_API_KEY`

✅ **Free Tier**: Unlimited requests!

---

### 2️⃣ **Google Cloud APIs**

1. Go to: https://console.cloud.google.com
2. Create a new project
3. Enable these APIs:
   - Cloud Speech-to-Text
   - Cloud Text-to-Speech
4. Create an API key (Credentials → Create Credentials → API Key)
5. Copy the API key and Project ID

**Set as environment variables:**
- `GOOGLE_STT_API_KEY` = your API key
- `GOOGLE_TTS_API_KEY` = your API key
- `GOOGLE_PROJECT_ID` = your project ID

✅ **Free Tier**:
- Speech-to-Text: 60 minutes/month
- Text-to-Speech: 4 million characters/month

---

## 🌐 Step 2: Deploy to Vercel

### Setup Repository

```bash
git add .
git commit -m "Add Vercel free APIs version"
git push origin main
```

### Deploy

1. Go to: https://vercel.com
2. Click **"New Project"**
3. Select **jarvis12** repository
4. Add **Environment Variables**:
   ```
   GROQ_API_KEY = your_groq_key
   GOOGLE_STT_API_KEY = your_google_stt_key
   GOOGLE_TTS_API_KEY = your_google_tts_key
   GOOGLE_PROJECT_ID = your_project_id
   JARVIS_SYSTEM_PROMPT = You are Jarvis...
   ```
5. Click **"Deploy"** ✨

---

## 📊 Free Tier Limits

| Service | Limit | Resets |
|---------|-------|--------|
| **Groq LLM** | Unlimited | - |
| **Google Speech-to-Text** | 60 min/month | Monthly |
| **Google Text-to-Speech** | 4M chars/month | Monthly |

**Example**: 100 conversations/month × ~30 seconds each = Within free tier ✅

---

## ✨ Features

✅ Completely free (no credit card after free trial)  
✅ Deployed on Vercel (accessible anywhere)  
✅ Fast responses (Groq is super fast)  
✅ Easy to customize  
✅ Production-ready

---

## 🔗 Your Live App

After deployment on Vercel, your JARVIS will be live at:
```
https://your-project.vercel.app
```

---

## 💡 Tips

1. **Monitor Usage**: Check Google Cloud Console for usage
2. **Set Alerts**: Get notified before limits
3. **Upgrade Later**: Move to paid if needed
4. **Test Locally**: Use `.env.local` before deploying

---

## 🆘 Troubleshooting

### "API Key Invalid"
- Check Google Cloud project has Speech-to-Text and Text-to-Speech enabled
- Verify Groq API key is correct

### "Quota Exceeded"
- You've used your monthly free tier
- Upgrade to paid plan or wait for reset

### "Microphone Not Working"
- Must use HTTPS (Vercel provides this automatically)
- Check browser permissions

---

**Ready? Deploy now!** 🚀

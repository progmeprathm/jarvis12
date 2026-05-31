/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    responseLimit: '50mb',
  },
  env: {
    DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  },
};

module.exports = nextConfig;

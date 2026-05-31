'use client';

import { useState, useRef } from 'react';
import './globals.css';

interface Message {
  id: string;
  type: 'user' | 'jarvis';
  content: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState('Ready');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addMessage = (type: 'user' | 'jarvis', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const startListening = async () => {
    try {
      setStatus('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus('🎤 Listening...');
      setIsListening(true);
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
    } catch (error) {
      setStatus('❌ Microphone access denied');
      console.error('Microphone error:', error);
    }
  };

  const stopListening = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setStatus('⏹️ Processing audio...');
        setIsProcessing(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);

        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        resolve();
      };
      mediaRecorder.stop();
    });
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Step 1: Transcribe audio
      setStatus('📝 Transcribing audio (Google Cloud)...');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        const error = await transcribeResponse.json();
        throw new Error(error.error || 'Transcription failed');
      }

      const transcribeData = await transcribeResponse.json();
      const userText = transcribeData.text;

      if (!userText) {
        setStatus('❌ Could not understand audio');
        setIsProcessing(false);
        return;
      }

      addMessage('user', userText);

      // Step 2: Get GPT response
      setStatus('🤖 Generating response (Groq)...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
        }),
      });

      if (!chatResponse.ok) {
        const error = await chatResponse.json();
        throw new Error(error.error || 'Chat request failed');
      }

      const chatData = await chatResponse.json();
      const jarvisResponse = chatData.response;

      addMessage('jarvis', jarvisResponse);

      // Step 3: Generate speech
      setStatus('🔊 Generating speech (Google Cloud)...');
      const synthesizeResponse = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: jarvisResponse }),
      });

      if (!synthesizeResponse.ok) {
        const error = await synthesizeResponse.json();
        throw new Error(error.error || 'Synthesis failed');
      }

      const audioData = await synthesizeResponse.arrayBuffer();
      const audioElement = new Audio(URL.createObjectURL(new Blob([audioData])));
      setStatus('🔉 Playing response...');
      audioElement.play();

      audioElement.onended = () => {
        setStatus('✅ Ready');
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  const toggleRecording = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setStatus('✅ Ready');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 JARVIS</h1>
        <p>Free AI Voice Assistant (Vercel Hosted)</p>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <h3>Controls</h3>

          <div className={`status ${
            isListening ? 'listening' : isProcessing ? 'processing' : ''
          }`}>
            {status}
          </div>

          <div className="tech-stack">
            <h4>Tech Stack</h4>
            <ul>
              <li>🎤 Google Cloud STT</li>
              <li>🤖 Groq LLM</li>
              <li>🔊 Google Cloud TTS</li>
            </ul>
          </div>

          <div className="controls">
            <button
              className="btn btn-primary"
              onClick={toggleRecording}
              disabled={isProcessing}
            >
              {isListening ? '⏹️ Stop Recording' : '🎤 Start Recording'}
            </button>
            <button
              className="btn btn-danger"
              onClick={clearConversation}
              disabled={isProcessing}
            >
              🗑️ Clear Chat
            </button>
          </div>
        </div>

        <div className="conversation-panel">
          <h3>Conversation</h3>
          <div className="conversation-list">
            {messages.length === 0 ? (
              <div className="empty-state">Start speaking to begin conversation...</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.type === 'user' ? 'user-message' : 'jarvis-message'}`}
                >
                  {msg.content}
                </div>
              ))
            )}
            {isProcessing && (
              <div className="message jarvis-message">
                Thinking<span className="loading"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

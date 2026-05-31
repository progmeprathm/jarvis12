'use client';

import { useState, useRef, useEffect } from 'react';
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
  const conversationContextRef = useRef<string>(
    'You are Jarvis, a witty and helpful AI assistant. Keep your answers to 1-2 short sentences.'
  );

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
      // Step 1: Transcribe audio with Whisper
      setStatus('📝 Transcribing audio (Whisper)...');
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

      // Step 2: Get response with Ollama
      setStatus('🤖 Generating response (Ollama)...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          conversationContext: conversationContextRef.current,
        }),
      });

      if (!chatResponse.ok) {
        const error = await chatResponse.json();
        throw new Error(error.error || 'Chat request failed');
      }

      const chatData = await chatResponse.json();
      const jarvisResponse = chatData.response;

      // Update conversation context
      conversationContextRef.current += `\nUser: ${userText}\nJarvis: ${jarvisResponse}`;

      addMessage('jarvis', jarvisResponse);

      // Step 3: Generate speech with Coqui TTS
      setStatus('🔊 Generating speech (Coqui TTS)...');
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
    conversationContextRef.current =
      'You are Jarvis, a witty and helpful AI assistant. Keep your answers to 1-2 short sentences.';
    setStatus('✅ Ready');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 JARVIS</h1>
        <p>Your AI Voice Assistant (100% Free & Open Source)</p>
      </div>

      <div className="main-content">
        {/* Sidebar */}
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
              <li>🎤 OpenAI Whisper</li>
              <li>🧠 Ollama (Llama 2)</li>
              <li>🔊 Coqui TTS</li>
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

        {/* Conversation Panel */}
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

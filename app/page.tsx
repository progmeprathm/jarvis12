'use client';

import { useState, useRef } from 'react';
import './globals.css';

interface Message {
  id: string;
  type: 'user' | 'jarvis';
  content: string;
  image?: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState('Ready');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addMessage = (type: 'user' | 'jarvis', content: string, image?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      image,
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

      const options = { mimeType: 'audio/webm;codecs=opus' };
      const mediaRecorder = new MediaRecorder(
        stream,
        MediaRecorder.isTypeSupported(options.mimeType) ? options : {}
      );
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

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);

        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        resolve();
      };
      mediaRecorder.stop();
    });
  };

  const processTextOrImage = async (text: string, image: string | null) => {
    try {
      setStatus('🤖 Generating response (Groq)...');
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          image: image,
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
      console.error('Error processing chat:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
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

      // Step 2 & 3: Chat and Synthesize
      await processTextOrImage(userText, null);
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

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() && !selectedImage) return;

    const messageToSend = textInput;
    const imageToSend = selectedImage;

    // Reset input fields immediately
    setTextInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add user message to UI
    addMessage('user', messageToSend, imageToSend || undefined);

    setIsProcessing(true);
    await processTextOrImage(messageToSend, imageToSend);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 JARVIS</h1>
        <p>Free AI Voice & Text Assistant (Vercel Hosted)</p>
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
              <li>🤖 Groq LLM (Llama 4 Scout)</li>
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
              <div className="empty-state">Start speaking or type a message below...</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.type === 'user' ? 'user-message' : 'jarvis-message'}`}
                >
                  {msg.image && (
                    <div className="message-image-container">
                      <img src={msg.image} alt="User attachment" className="message-image" />
                    </div>
                  )}
                  <div className="message-text">{msg.content}</div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="message jarvis-message">
                Thinking<span className="loading"></span>
              </div>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSendText}>
            {selectedImage && (
              <div className="image-preview-bar">
                <img src={selectedImage} alt="preview" className="thumbnail" />
                <button type="button" className="remove-image-btn" onClick={removeSelectedImage}>
                  ✕ Remove
                </button>
              </div>
            )}
            
            <div className="input-group">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="btn-attach"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                title="Attach Image"
              >
                📎
              </button>
              <input
                type="text"
                placeholder="Type a message to JARVIS..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isProcessing}
                className="text-input"
              />
              <button
                type="submit"
                className="btn btn-send"
                disabled={isProcessing || (!textInput.trim() && !selectedImage)}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

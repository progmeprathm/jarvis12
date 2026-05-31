'use client';

import { useState, useRef, useEffect } from 'react';
import './globals.css';

interface Message {
  id: string;
  type: 'user' | 'jarvis';
  content: string;
  image?: string;
  audioUrl?: string;
  timestamp: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState('Ready');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Accessibility state modifications for middle-aged users
  const [fontSize, setFontSize] = useState<'normal' | 'medium' | 'large'>('normal');
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Audio playback state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom of container when messages or state updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isProcessing]);

  const addMessage = (type: 'user' | 'jarvis', content: string, image?: string, audioUrl?: string) => {
    const newId = Date.now().toString() + Math.random().toString().substring(2, 6);
    const newMessage: Message = {
      id: newId,
      type,
      content,
      image,
      audioUrl,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newId;
  };

  const updateMessageAudio = (id: string, audioUrl: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, audioUrl } : msg))
    );
  };

  // Play/pause handler for specific message audio
  const playAudio = (msgId: string, audioUrl: string) => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    activeAudioRef.current = audio;
    setPlayingMessageId(msgId);
    setStatus('🔊 Playing response...');

    audio.onended = () => {
      setPlayingMessageId(null);
      activeAudioRef.current = null;
      setStatus('Ready');
    };

    audio.onpause = () => {
      setPlayingMessageId(null);
    };

    audio.onerror = () => {
      setPlayingMessageId(null);
      activeAudioRef.current = null;
      setStatus('Ready');
    };

    audio.play().catch((err) => {
      console.error('Audio playback failed:', err);
      setPlayingMessageId(null);
      setStatus('Ready');
    });
  };

  const pauseAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
    }
    setPlayingMessageId(null);
    setStatus('Ready');
  };

  const toggleAudio = (msgId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    if (playingMessageId === msgId) {
      pauseAudio();
    } else {
      playAudio(msgId, audioUrl);
    }
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
      setStatus('🤖 Generating response...');
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

      // Add text message to history
      const jarvisMsgId = addMessage('jarvis', jarvisResponse);
      setIsProcessing(false);

      // If muted, we don't synthesize speech or play audio (saves API costs & keeps user interface silent)
      if (isMuted) {
        setStatus('Ready');
        return;
      }

      // Synthesize speech in background with speed configurations
      setStatus('🔊 Generating speech...');
      const synthesizeResponse = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: jarvisResponse,
          speed: speechSpeed
        }),
      });

      if (!synthesizeResponse.ok) {
        const error = await synthesizeResponse.json();
        throw new Error(error.error || 'Synthesis failed');
      }

      const audioData = await synthesizeResponse.arrayBuffer();
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Update message with playable audio
      updateMessageAudio(jarvisMsgId, audioUrl);
      
      // Auto play synthesized voice
      playAudio(jarvisMsgId, audioUrl);
    } catch (error) {
      console.error('Error processing chat:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setStatus('📝 Transcribing audio...');
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
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setPlayingMessageId(null);
    setMessages([]);
    setStatus('Ready');
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() && !selectedImage) return;

    const messageToSend = textInput;
    const imageToSend = selectedImage;

    setTextInput('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

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

  // Copy text helper for easy message sharing
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setStatus('📋 Copied to clipboard');
      setTimeout(() => setStatus('Ready'), 2000);
    }).catch((err) => {
      console.error('Failed to copy text:', err);
    });
  };

  // Estimate audio length visually based on response word count
  const getEstimatedDuration = (text: string) => {
    const words = text.split(/\s+/).length;
    const seconds = Math.max(2, Math.round(words / 2.5));
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render a simulated audio player next to play/pause controls
  const renderWaveform = (isPlaying: boolean) => {
    const barHeights = [40, 60, 30, 70, 50, 80, 45, 65, 35, 55, 40, 60, 30, 70, 50, 80];
    return (
      <div className="waveform">
        {barHeights.map((height, i) => (
          <span
            key={i}
            className={`waveform-bar ${isPlaying ? 'animating' : ''}`}
            style={{
              height: `${height}%`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="app-layout">
      {/* Background radial blobs for the ambient glow */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>

      <div className="glass-container">
        {/* Header Section with Accessibility Adjustments */}
        <div className="app-header">
          <div className="header-left">
            <div className="header-avatar">J</div>
            <div className="header-info">
              <h2>JARVIS Assistant</h2>
              <div className="online-indicator">
                <span className={`dot ${
                  isListening ? 'dot-listening' : isProcessing ? 'dot-thinking' : 'dot-online'
                }`}></span>
                <span>
                  {isListening ? 'Listening...' : isProcessing ? 'Thinking...' : 'Online & Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="header-settings">
            {/* Font Size Settings */}
            <div className="setting-item" title="Change text size">
              <span className="setting-label">Text:</span>
              <button 
                type="button" 
                className={`setting-btn ${fontSize === 'normal' ? 'active' : ''}`}
                onClick={() => setFontSize('normal')}
              >
                A
              </button>
              <button 
                type="button" 
                className={`setting-btn font-med ${fontSize === 'medium' ? 'active' : ''}`}
                onClick={() => setFontSize('medium')}
              >
                A+
              </button>
              <button 
                type="button" 
                className={`setting-btn font-lg ${fontSize === 'large' ? 'active' : ''}`}
                onClick={() => setFontSize('large')}
              >
                A++
              </button>
            </div>

            {/* Speaking Rate Speed Selector */}
            <div className="setting-item" title="Speech speed">
              <span className="setting-label">Speed:</span>
              <select 
                value={speechSpeed} 
                onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                className="speed-select"
              >
                <option value="0.8">Slower (0.8x)</option>
                <option value="1.0">Normal (1.0x)</option>
                <option value="1.2">Faster (1.2x)</option>
              </select>
            </div>

            {/* Mute voice responses */}
            <button
              type="button"
              className={`mute-toggle-btn ${isMuted ? 'muted' : ''}`}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute speech output' : 'Mute speech output'}
            >
              {isMuted ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Conversation Logs */}
        <div className={`conversation-container size-${fontSize}`} ref={chatContainerRef}>
          <div className="date-separator">
            Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </div>

          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-state">
                Hello! I'm JARVIS, your personal assistant. I'm here to help you with questions, tasks, or just a friendly conversation. Tap the microphone button to speak to me directly, or type below.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-wrapper ${
                    msg.type === 'user' ? 'user-wrapper' : 'jarvis-wrapper'
                  }`}
                >
                  {/* Assistant Avatar at bottom-left */}
                  {msg.type === 'jarvis' && (
                    <div className="assistant-avatar">J</div>
                  )}

                  <div className={`chat-bubble ${msg.type}-bubble`}>
                    {/* Render Image inside User Bubble if present */}
                    {msg.image && (
                      <div className="bubble-image-container">
                        <img src={msg.image} alt="Attached file" />
                      </div>
                    )}
                    
                    <div className="bubble-text">{msg.content}</div>

                    {/* Integrated Speech Audio Player for JARVIS Responses */}
                    {msg.type === 'jarvis' && (
                      <div className="audio-player-control">
                        {msg.audioUrl ? (
                          <button
                            type="button"
                            className={`audio-btn ${playingMessageId === msg.id ? 'playing' : ''}`}
                            onClick={() => toggleAudio(msg.id, msg.audioUrl)}
                            title={playingMessageId === msg.id ? 'Pause response' : 'Play response'}
                          >
                            {playingMessageId === msg.id ? (
                              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>
                        ) : (
                          // Soft mute placeholder or voice generation indicator
                          <span className="voice-placeholder-icon" title="Audio response not generated or muted">
                            🔇
                          </span>
                        )}
                        {renderWaveform(playingMessageId === msg.id)}
                        <span className="audio-duration">
                          {getEstimatedDuration(msg.content)}
                        </span>
                        
                        {/* Copy Response Button */}
                        <button
                          type="button"
                          className="copy-text-btn"
                          onClick={() => copyToClipboard(msg.content)}
                          title="Copy text response"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div className="bubble-timestamp">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isProcessing && (
              <div className="message-wrapper jarvis-wrapper">
                <div className="assistant-avatar">J</div>
                <div className="chat-bubble jarvis-bubble loading-bubble">
                  <div className="bubble-text">
                    Thinking<span className="loading-dot"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="controls-footer">
          {selectedImage && (
            <div className="image-preview-strip">
              <img src={selectedImage} alt="Attachment preview" />
              <button type="button" className="remove-preview-btn" onClick={removeSelectedImage}>
                ✕ Remove
              </button>
            </div>
          )}

          <form className="input-row" onSubmit={handleSendText}>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            
            <button
              type="button"
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              title="Attach photo"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <input
              type="text"
              placeholder="Type a message here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isProcessing}
              className="message-input"
            />

            <button
              type="submit"
              className="send-btn"
              disabled={isProcessing || (!textInput.trim() && !selectedImage)}
              title="Send message"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>

          {/* Large, accessible voice control actions */}
          <div className="action-buttons-row">
            <button
              className={`mic-button ${isListening ? 'listening' : ''}`}
              onClick={toggleRecording}
              disabled={isProcessing}
            >
              {isListening ? '⏹️ TAP TO STOP' : '🎤 TAP TO SPEAK'}
            </button>

            <button
              className="clear-button"
              onClick={clearConversation}
              disabled={isProcessing}
            >
              Clear Chat
            </button>
          </div>

          {/* Simple status log */}
          <div className="status-indicator-text">
            Status: <span className="status-val">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

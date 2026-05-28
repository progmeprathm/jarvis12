import os

# Define the project directory layout and file contents
project_structure = {
    # -------------------------------------------------------------
    # BACKEND FILES
    # -------------------------------------------------------------
    "backend/requirements.txt": """fastapi==0.111.0
uvicorn==0.30.1
langgraph==0.0.60
langchain-core==0.2.9
langchain-openai==0.1.9
pydantic==2.7.4
""",

    "backend/main.py": """import os
import json
from typing import Annotated, TypedDict, Literal
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

app = FastAPI(title="Jarvis Agentic Core", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@tool
def get_weather(location: str) -> str:
    \"\"\"Fetch the current weather for a specific location context.\"\"\"
    loc = location.lower()
    if "new york" in loc:
        return "The weather in New York is 65°F (18°C) and partly cloudy."
    elif "san francisco" in loc:
        return "The weather in San Francisco is 58°F (14°C) with fog."
    elif "london" in loc:
        return "The weather in London is 52°F (11°C) with light drizzle."
    return f"The weather in {location} is currently 72°F (22°C) and clear sunny skies."

@tool
def get_calendar_events() -> str:
    \"\"\"Retrieve scheduled calendar appointments and tasks for the day.\"\"\"
    events = [
        {"time": "09:00 AM", "title": "Project Kickoff Meeting with Dev Team"},
        {"time": "12:30 PM", "title": "Lunch with Design Lead"},
        {"time": "04:00 PM", "title": "Review Jarvis Bot Architecture Blueprint"}
    ]
    return "Today's Schedule:\\n" + "\\n".join([f"- {e['time']}: {e['title']}" for e in events])

tools = [get_weather, get_calendar_events]
tool_node = ToolNode(tools)

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.5)
llm_with_tools = llm.bind_tools(tools)

def call_model(state: AgentState):
    messages = state['messages']
    if not messages or (hasattr(messages[0], 'type') and messages[0].type != "system"):
        system_prompt = {
            "role": "system",
            "content": "You are Jarvis, an advanced AI. Be highly intelligent, clear, and direct. Use tools when needed."
        }
        messages = [system_prompt] + messages
    
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    last_message = state['messages'][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return "__end__"

workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", tool_node)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

jarvis_brain = workflow.compile()

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    session_messages = []
    
    try:
        while True:
            raw_data = await websocket.receive_text()
            payload = json.loads(raw_data)
            user_input = payload.get("message", "")
            
            session_messages.append(HumanMessage(content=user_input))
            await websocket.send_json({"type": "status", "content": "Jarvis is processing instructions..."})
            
            async for event in jarvis_brain.astream({"messages": session_messages}):
                for node_name, output in event.items():
                    if node_name == "tools":
                        await websocket.send_json({
                            "type": "status", 
                            "content": "Running autonomous API execution loops..."
                        })
                    elif node_name == "agent":
                        agent_msg = output["messages"][-1]
                        if not agent_msg.tool_calls and agent_msg.content:
                            await websocket.send_json({
                                "type": "message",
                                "content": agent_msg.content
                            })
            
            state_snapshot = await jarvis_brain.aget_state(config={})
            if state_snapshot.values and "messages" in state_snapshot.values:
                session_messages = state_snapshot.values["messages"]

    except WebSocketDisconnect:
        print("Active pipeline interface disconnected securely.")
""",

    # -------------------------------------------------------------
    # FRONTEND CONFIG FILES
    # -------------------------------------------------------------
    "frontend/package.json": """{
  "name": "jarvis-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.395.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.2.11"
  }
}
""",

    "frontend/index.html": """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jarvis Core Console</title>
  </head>
  <body class="bg-slate-950">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",

    "frontend/src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
""",

    "frontend/src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;
""",

    # -------------------------------------------------------------
    # FRONTEND REACT APPLICATION (JarvisApp.jsx Integration)
    # -------------------------------------------------------------
    "frontend/src/App.jsx": """import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Radio, Cloud, Calendar, ShieldCheck, Mic, MicOff, Send } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    { sender: 'jarvis', text: 'Systems initialized. Online and ready for your command, operator.', type: 'message' }
  ]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('Connected & Idle');
  const [isListening, setIsListening] = useState(false);
  
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const wsUrl = window.location.hostname === 'localhost' 
      ? 'ws://localhost:8000/ws/chat'
      : `ws://${window.location.host}/ws/chat`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setStatus(data.content);
      } else if (data.type === 'message') {
        setMessages((prev) => [...prev, { sender: 'jarvis', text: data.content, type: 'message' }]);
        setStatus('Connected & Idle');
      }
    };

    ws.current.onclose = () => setStatus('Pipeline disconnected. Reconnecting...');
    return () => ws.current?.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSend = () => {
    if (!input.trim() || !ws.current) return;
    setMessages((prev) => [...prev, { sender: 'user', text: input, type: 'message' }]);
    ws.current.send(json.stringify({ message: input }));
    setInput('');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <aside className="w-80 bg-slate-900/60 border-r border-slate-800/80 p-6 flex flex-col gap-6 backdrop-blur-md">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="font-bold tracking-wider uppercase text-sm bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">JARVIS CORE</h1>
            <p className="text-[11px] text-slate-500 font-mono tracking-widest">v1.0.0-AGENTIC</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-[11px] font-mono tracking-widest text-slate-500 uppercase px-1">Active Pipeline State</div>
          <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-4 font-mono text-xs flex items-center gap-3">
            <Radio className={`w-4 h-4 ${status.includes('Idle') ? 'text-emerald-400' : 'text-cyan-400 animate-ping'}`} />
            <span className={status.includes('Idle') ? 'text-slate-400' : 'text-cyan-300 font-medium'}>{status}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <div className="text-[11px] font-mono tracking-widest text-slate-500 uppercase px-1 mb-2">Available Capabilities</div>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/40 border border-slate-800/40 rounded-lg text-xs text-slate-400">
            <Cloud className="w-4 h-4 text-sky-400" /> Weather System Integration
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/40 border border-slate-800/40 rounded-lg text-xs text-slate-400">
            <Calendar className="w-4 h-4 text-indigo-400" /> Enterprise Calendar Sync
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/40 border border-slate-800/40 rounded-lg text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> LangGraph Core Security Guard
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl flex gap-4 p-4 rounded-2xl border transition-all \${
                msg.sender === 'user' 
                  ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100 rounded-tr-none' 
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-200 rounded-tl-none'
              }\`}>
                <div className="mt-0.5 shrink-0">
                  {msg.sender === 'user' ? <Terminal className="w-4 h-4 text-cyan-400" /> : <Cpu className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</div>
              </div>
            </div>
          ))}
          {!status.includes('Idle') && (
            <div className="flex justify-start">
              <div className="bg-slate-900/20 border border-slate-800/40 p-4 rounded-2xl rounded-tl-none flex items-center gap-3 text-sm text-slate-500 font-mono italic">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                {status}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-6 bg-slate-900/20 border-t border-slate-900 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex gap-4 items-center bg-slate-950 border border-slate-800/80 rounded-2xl p-2 pl-4 focus-within:border-cyan-500/50 shadow-2xl transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Transmit direct command arrays..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-600 font-mono"
            />
            <button 
              onClick={() => setIsListening(!isListening)}
              className={`p-2.5 rounded-xl border transition-all \${
                isListening 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }\`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button onClick={handleSend} className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-xl shadow-lg">
              <Send className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
""",

    # -------------------------------------------------------------
    # DOCUMENTATION
    # -------------------------------------------------------------
    "README.md": """# Jarvis Agentic Bot (Phase 1 MVP)

Full-stack dual-engine application setup incorporating a Python LangGraph core connected over low-latency WebSockets to a tailored React UI dashboard layout.

## Instructions
1. Navigate to `/backend`, run `pip install -r requirements.txt`. Export `OPENAI_API_KEY`.
2. Start server via `uvicorn main:app --reload --port 8000`.
3. Open a second terminal window, go to `/frontend`, run `npm install` then `npm run dev`.
"""
}

def build_project():
    print("🚀 Initializing workspace logic structure...")
    for file_path, content in project_structure.items():
        # Ensure targeted subdirectory trees exist dynamically
        dir_name = os.path.dirname(file_path)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name, exist_ok=True)
            
        # Safely output file streams onto disk nodes
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(file_path, "-> Created successfully.")
        
    print("\\n✨ Structuring Complete! Your application files are neatly generated inside their designated directories.")

if __name__ == "__main__":
    build_project()
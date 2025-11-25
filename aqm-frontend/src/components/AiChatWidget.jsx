import { useState, useRef, useEffect } from "react";
import "./AiChatWidget.css";

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Здравствуйте, вас приветствует ИИ консультант ICPAIR!" }
  ]);
  const [fallbackActive, setFallbackActive] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const [apiKey, setApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    // load dev api key from localStorage if present
    try {
      const key = localStorage.getItem('OPENROUTER_API_KEY_DEV') || '';
      setApiKey(key);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // scroll to bottom when messages change
    try {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }
    } catch (e) {
      // ignore
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (loading) return; // prevent duplicate sends
    const messageText = input.trim();
    if (!messageText) return;

    const userMessage = { from: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // --- FIX: Ensure we use the correct backend port (5005) ---
    let BASE_URL = process.env.REACT_APP_API_URL;
    if (!BASE_URL) {
        BASE_URL = "http://localhost:5005/api";
    }

    try {
      const body = { message: messageText };
      // include apiKey when present (dev-only override)
      if (apiKey && apiKey.length > 0) body.apiKey = apiKey;

      const response = await fetch(`${BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        // Try to parse error body if possible
        let errText = 'Ошибка при получении ответа от сервера.';
        try {
          const errData = await response.json();
          if (errData && errData.reply) errText = errData.reply;
        } catch (e) {
          // ignore parse errors
        }
        setMessages((prev) => [...prev, { from: "bot", text: errText }]);
        setFallbackActive(true);
      } else {
        const data = await response.json();
        setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
        setFallbackActive(!!data.fallback);
      }
    } catch (err) {
      console.error("Chat error:", err);
      // If network or other fetch error occurs, generate a client-side fallback reply
      const generateLocalFallback = (text) => {
        const t = text.toLowerCase();
        if (t.includes('pm') || t.includes('pm2') || t.includes('пыль') || t.includes('pm2.5')) {
          return 'PM2.5 — мелкие частицы, вредны для дыхания. Старайтесь находиться в помещениях и использовать фильтры.';
        } else if (t.includes('маск') || t.includes('mask')) {
          return 'Медицинская маска или респиратор уровня N95/FFP2 лучше защищают от мелкой пыли.';
        } else if (t.includes('очист') || t.includes('фильтр')) {
          return 'Эффективен очиститель с HEPA-фильтром для удаления частиц PM2.5.';
        } else if (t.includes('здоров') || t.includes('боль')) {
          return 'При проблемах с дыханием обратитесь к врачу. Ограничьте время на улице при плохом качестве воздуха.';
        }
        return 'Сеть или сервер недоступны. Попробуйте задать вопрос про маски, фильтры или PM2.5.';
      };

      const fallbackReply = generateLocalFallback(messageText);
      setMessages((prev) => [...prev, { from: "bot", text: fallbackReply }]);
      setFallbackActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const saveApiKey = () => {
    try {
      localStorage.setItem('OPENROUTER_API_KEY_DEV', apiKey);
      setShowSettings(false);
    } catch (e) {
      console.error('Failed to save API key', e);
    }
  };

  return (
    <div>
      {/* FIX: Removed the typo 'img' attribute from this button */}
      <button className="chat-toggle-btn" onClick={toggleChat}>
        <img src="/Images/chat.svg" alt="chat"></img>
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <span>ИИ-консультант ICPAIR</span>
              {fallbackActive && (
                <span className="tooltip-container">
                  <span className="offline-badge">Ограниченный режим</span>
                  <span className="tooltip-text">Ответы ограничены локальным режимом. Введите OpenRouter API key в настройках (⚙) для полнофункционального ИИ.</span>
                </span>
              )}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              {process.env.NODE_ENV !== 'production' && (
                <span className="tooltip-container">
                  <button className="settings-toggle" onClick={() => setShowSettings(s => !s)} title="Dev settings">⚙</button>
                  <span className="tooltip-text">Dev: вставьте OpenRouter API key здесь, чтобы тестировать живые ответы без перезапуска сервера.</span>
                </span>
              )}
              <button onClick={toggleChat} className="close-btn">×</button>
            </div>
          </div>

          {showSettings && process.env.NODE_ENV !== 'production' && (
            <div className="settings-panel">
              <label>Dev API key (OpenRouter)</label>
              <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
              <div style={{display:'flex', gap:'8px', marginTop:'6px'}}>
                <button className="save-btn" onClick={saveApiKey}>Save</button>
                <button className="save-btn" onClick={() => { setApiKey(''); localStorage.removeItem('OPENROUTER_API_KEY_DEV'); }}>Clear</button>
              </div>
            </div>
          )}

          <div className="chat-messages" ref={messagesRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.from}`}>
                {msg.text}
              </div>
            ))}
            {/* Show simple loading indicator inside chat */}
            {loading && <div className="chat-message bot">...</div>}
          </div>

          <div className="chat-input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Введите текст..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}
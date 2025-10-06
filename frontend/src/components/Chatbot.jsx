import { MessageSquareMore, X, Send, Sparkles, User, Bot, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm your virtual assistant. I can help you with / मैं आपकी मदद कर सकता हूँ:",
      suggestions: [
        "Language settings / भाषा सेटिंग्स",
        "Live streaming / लाइव स्ट्रीमिंग",
        "Upload materials / सामग्री अपलोड करें",
        "Login & logout / लॉगिन और लॉगआउट"
      ]
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Multilingual rule definitions
  const rules = [
    {
      keywords: ["language", "change", "switch", "भाषा", "बदलें"],
      reply: "🌐 English: Change language from top-right in navbar.\n🌐 हिंदी: भाषा बदलने के लिए नेवबार के ऊपर-दाएं कोने में विकल्प चुनें।",
    },
    {
      keywords: ["start", "live", "stream", "शुरू", "लाइव"],
      reply: "📹 English: Go to Teacher page → Live → Configure → Start Streaming.\n📹 हिंदी: शिक्षक पृष्ठ → लाइव → सेटिंग्स करें → स्ट्रीम शुरू करें।",
    },
    {
      keywords: ["join", "watch", "class", "live", "शामिल", "देखें"],
      reply: "👥 English: Students join live sessions via Student page → Live section.\n👥 हिंदी: छात्र लाइव सत्र में Student पृष्ठ → लाइव सेक्शन से शामिल हो सकते हैं।",
    },
    {
      keywords: ["upload", "add", "submit", "अपलोड", "जमा करें"],
      reply: "📤 English: Upload materials from Teacher page → Upload section.\n📤 हिंदी: सामग्री अपलोड करने के लिए शिक्षक पृष्ठ → अपलोड सेक्शन पर जाएं।",
    },
    {
      keywords: ["login", "sign in", "log in", "लॉगिन"],
      reply: "🔐 English: Visit /login → Enter credentials → Redirected based on role.\n🔐 हिंदी: /login पर जाएं → क्रेडेंशियल दर्ज करें → रोल के अनुसार रीडायरेक्ट।",
    },
    {
      keywords: ["logout", "log out", "sign out", "लॉगआउट"],
      reply: "👋 English: Click profile → Logout.\n👋 हिंदी: प्रोफ़ाइल पर क्लिक करें → लॉगआउट।",
    },
    {
      keywords: ["admin", "administration", "प्रशासन"],
      reply: "⚙️ English: Login with Admin credentials → Admin panel.\n⚙️ हिंदी: एडमिन क्रेडेंशियल से लॉगिन करें → एडमिन पैनल।",
    },
    {
      keywords: ["help", "support", "contact", "सहायता"],
      reply: "💬 English: Check Contact info or email support@example.com.\n💬 हिंदी: संपर्क जानकारी देखें या support@example.com पर ईमेल करें।",
    },
    {
      keywords: ["hello", "hi", "hey", "नमस्ते", "हाय"],
      reply: "👋 English: Hello! Ask about language, live streaming, uploads, or account.\n👋 हिंदी: नमस्ते! भाषा, लाइव स्ट्रीमिंग, अपलोड या अकाउंट के बारे में पूछें।",
    },
    {
      keywords: ["thank", "thanks", "धन्यवाद"],
      reply: "You're welcome! 😊 / आपका स्वागत है! 😊",
    },
  ];

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // Add user message
    const userMsg = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const lower = text.toLowerCase();
      const found = rules.find((r) => r.keywords.some((kw) => lower.includes(kw)));
      const reply = found
        ? found.reply
        : "I can help you with / मैं आपकी मदद कर सकता हूँ:\n• Language settings / भाषा सेटिंग्स\n• Live streaming / लाइव स्ट्रीमिंग\n• Upload materials / सामग्री अपलोड करें\n• Account management / अकाउंट मैनेजमेंट";

      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed right-6 bottom-6 z-50 font-sans">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-5 py-3 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-2 font-semibold"
        >
          <MessageSquareMore className="w-5 h-5" />
          <span>Chat</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </button>
      ) : (
        <div className="w-96 h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Help Assistant</h3>
                <p className="text-xs text-blue-100">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  m.role === "user" 
                    ? "bg-gradient-to-br from-blue-500 to-blue-600" 
                    : "bg-gradient-to-br from-purple-500 to-pink-500"
                }`}>
                  {m.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className="flex flex-col gap-2 max-w-[75%]">
                  <div className={`rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 shadow-md border border-gray-100 rounded-tl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>
                  </div>
                  {m.suggestions && (
                    <div className="flex flex-wrap gap-2">
                      {m.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="text-xs px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:border-blue-300 transition-colors shadow-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question... / अपना प्रश्न टाइप करें..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl px-4 py-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line / भेजने के लिए Enter • नई लाइन के लिए Shift+Enter
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;

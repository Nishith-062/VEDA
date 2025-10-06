import { MessageSquareMore, X, Send, Sparkles, User, Bot, Minimize2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm your virtual assistant. I can help you with:",
      suggestions: [
        "Language settings",
        "Live streaming",
        "Upload materials",
        "Login & logout"
      ]
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { role: "user", text };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const lower = text.toLowerCase();

      const rules = [
        {
          test: (s) =>
            s.includes("language") && (s.includes("change") || s.includes("switch") || s.includes("where") || s.includes("setting")),
          reply:
            "🌐 You can change the language from the top-right corner of the navbar. Look for the language selector icon!",
        },
        {
          test: (s) => s.includes("start") && (s.includes("live") || s.includes("stream")),
          reply:
            "📹 Teachers can start a live stream by:\n1. Navigate to the Teacher page\n2. Click on the 'Live' option\n3. Configure your stream settings\n4. Click 'Start Streaming'",
        },
        {
          test: (s) => (s.includes("join") || s.includes("watch")) && (s.includes("live") || s.includes("class") || s.includes("stream")),
          reply:
            "👥 Students can join live sessions from:\n• Student page → Live section\n• Check the schedule for upcoming streams\n• Click 'Join' when the class is live",
        },
        {
          test: (s) => s.includes("upload") || s.includes("add") || s.includes("submit"),
          reply:
            "📤 To upload materials:\n• Go to the Teacher page\n• Find the upload section\n• Select your files\n• Add descriptions and click Upload\n\nSupported formats: PDF, PPT, DOC, images",
        },
        {
          test: (s) => s.includes("login") || s.includes("sign in"),
          reply:
            "🔐 Login steps:\n1. Visit the Login page (/login)\n2. Enter your credentials\n3. You'll be redirected based on your role:\n   • Students → Student Dashboard\n   • Teachers → Teacher Dashboard\n   • Admins → Admin Panel",
        },
        {
          test: (s) => s.includes("logout") || s.includes("log out") || s.includes("sign out"),
          reply:
            "👋 To logout:\n• Click your profile icon in the top-right\n• Select 'Logout' from the dropdown\n• You'll be redirected to the home page",
        },
        {
          test: (s) => s.includes("admin") || s.includes("administration"),
          reply:
            "⚙️ Admin access:\n• Login with Admin credentials\n• Access the Admin panel at /admin\n• Manage users, content, and system settings\n\nNote: Admin privileges required",
        },
        {
          test: (s) => s.includes("help") || s.includes("support") || s.includes("contact"),
          reply:
            "💬 Need more help?\n• Check footer links for Contact info\n• Review Privacy Policy and Terms\n• Reach out to your system administrator\n• Email: support@example.com",
        },
        {
          test: (s) => s.includes("hello") || s.includes("hi") || s.includes("hey"),
          reply:
            "👋 Hello! How can I assist you today? Feel free to ask about language settings, live streaming, uploads, or account management!",
        },
        {
          test: (s) => s.includes("thank") || s.includes("thanks"),
          reply:
            "You're welcome! 😊 If you need anything else, just ask. I'm here to help!",
        },
      ];

      let reply = "I can help you with:\n• Language settings 🌐\n• Live streaming 📹\n• Uploading materials 📤\n• Account management 🔐\n\nWhat would you like to know?";
      const found = rules.find((r) => r.test(lower));
      if (found) reply = found.reply;

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
                  {m.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex flex-col gap-2 max-w-[75%]`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 shadow-md border border-gray-100 rounded-tl-sm"
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>
                  </div>
                  {m.suggestions && (
                    <div className="flex flex-wrap gap-2">
                      {m.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:border-blue-300 transition-colors shadow-sm"
                        >
                          {suggestion}
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
                placeholder="Type your question..."
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
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
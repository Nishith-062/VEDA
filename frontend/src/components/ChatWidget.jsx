import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

// Lightweight helper to match user intent with simple keyword rules
const getReply = (text) => {
  const q = text.toLowerCase();

  // Primary question the user requested support for
  if (
    q.includes("language") ||
    q.includes("translate") ||
    q.includes("change language") ||
    q.includes("i18n") ||
    q.includes("locale")
  ) {
    return (
      "You can change the language using the Language Selector in the top navbar — it's on the right side, next to your profile name."
    );
  }

  // Small extra FAQs (kept simple)
  if (q.includes("logout") || q.includes("log out")) {
    return "Click your name in the top-right and choose Logout from the dropdown.";
  }

  if (q.includes("live") || q.includes("class") || q.includes("join")) {
    return "Students: go to /student or use the Student page, then choose Live. Teachers: go to /teacher and start Live.";
  }

  return "I'm here to help! Ask me where things are (e.g., 'Where is the language change option?').";
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can guide you around the app. Try: ‘Where is the language change option?’",
    },
  ]);

  const endRef = useRef(null);
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg = { role: "user", content: text };
    const reply = { role: "assistant", content: getReply(text) };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  };

  return (
    <div>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center justify-center rounded-full shadow-lg bg-red-500 hover:bg-red-600 text-white w-14 h-14 focus:outline-none focus:ring-4 focus:ring-red-300"
        aria-label={open ? "Close help chat" : "Open help chat"}
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-80 max-h-[70vh] bg-white/95 backdrop-blur border border-gray-200 shadow-xl rounded-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Assistant</div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === "assistant" ? "flex" : "flex justify-end"}>
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
                    m.role === "assistant"
                      ? "bg-white border border-gray-200 text-gray-800"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="p-2 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

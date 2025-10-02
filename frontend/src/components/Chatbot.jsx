import { MessageSquareMore } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text:
        "Hi! You can ask things like: 'Where is language change?', 'How to start live stream?', 'How to upload?'.",
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { role: "user", text };

    // Simple rule-based replies
    const lower = text.toLowerCase();

    const rules = [
      {
        test: (s) =>
          s.includes("language") && (s.includes("change") || s.includes("switch") || s.includes("where")),
        reply:
          "The language change option is in the top-right corner of the navbar.",
      },
      {
        test: (s) => s.includes("start") && (s.includes("live") || s.includes("stream")),
        reply:
          "Teachers can start a live stream by navigating to the Teacher page and using the 'Live' option (e.g., /teacher → Live).",
      },
      {
        test: (s) => (s.includes("join") || s.includes("watch")) && (s.includes("live") || s.includes("class")),
        reply:
          "Students can join a live session from the Student page via the 'Live' option (e.g., /student → Live).",
      },
      {
        test: (s) => s.includes("upload") || s.includes("add") || s.includes("submit"),
        reply:
          "To upload materials/lectures, use the upload option in the relevant page section (Teacher page typically has upload controls).",
      },
      {
        test: (s) => s.includes("login") || s.includes("sign in"),
        reply:
          "Go to the Login page (/login). After login, you'll be redirected based on your role (Student/Teacher/Admin).",
      },
      {
        test: (s) => s.includes("logout") || s.includes("log out"),
        reply:
          "Open the user dropdown in the top-right of the navbar and click Logout.",
      },
      {
        test: (s) => s.includes("admin"),
        reply:
          "Admins can access the Admin page at /admin after logging in with an Admin account.",
      },
      {
        test: (s) => s.includes("help") || s.includes("support") || s.includes("contact"),
        reply:
          "For help, check the footer links (Contact/Privacy/Terms) or reach out to your project admin.",
      },
    ];

    let reply =
      "I'm here to help with quick tips like language change, starting/joining live, uploading, and login/logout.";
    const found = rules.find((r) => r.test(lower));
    if (found) reply = found.reply;

    setMessages((prev) => [...prev, userMsg, { role: "bot", text: reply }]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Inline styles to avoid touching global CSS
  const styles = {
    container: {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: 1000,
      fontFamily:
        "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
    },
    toggleBtn: {
      background: "#2563eb", // blue-600
      color: "white",
      border: "none",
      borderRadius: "9999px",
      padding: "10px 14px",
      cursor: "pointer",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      fontWeight: 600,
    },
    panel: {
      width: "300px",
      height: "360px",
      background: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      padding: "10px 12px",
      background: "#f8fafc",
      borderBottom: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontWeight: 600,
    },
    body: {
      flex: 1,
      padding: "10px",
      overflowY: "auto",
      background: "#ffffff",
    },
    msgUser: {
      alignSelf: "flex-end",
      background: "#e0f2fe",
      color: "#0c4a6e",
      padding: "8px 10px",
      borderRadius: "10px",
      margin: "6px 0",
      maxWidth: "80%",
    },
    msgBot: {
      alignSelf: "flex-start",
      background: "#f1f5f9",
      color: "#0f172a",
      padding: "8px 10px",
      borderRadius: "10px",
      margin: "6px 0",
      maxWidth: "80%",
    },
    footer: {
      borderTop: "1px solid #e5e7eb",
      padding: "8px",
      display: "flex",
      gap: "8px",
      background: "#f8fafc",
    },
    input: {
      flex: 1,
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "8px 10px",
      outline: "none",
    },
    sendBtn: {
      background: "#10b981", // emerald-500
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 12px",
      cursor: "pointer",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.container}>
      {!open ? (
        <button style={styles.toggleBtn} onClick={() => setOpen(true)}>
         <MessageSquareMore /> Chat
        </button>
      ) : (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span>Help Bot</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 18,
              }}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>
          <div style={styles.body}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {messages.map((m, idx) => (
                <div key={idx} style={m.role === "user" ? styles.msgUser : styles.msgBot}>
                  {m.text}
                </div>
              ))}
            </div>
          </div>
          <div style={styles.footer}>
            <input
              ref={inputRef}
              style={styles.input}
              value={input}
              placeholder="Type your question..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button style={styles.sendBtn} onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;

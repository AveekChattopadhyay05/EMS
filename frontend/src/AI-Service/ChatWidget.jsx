import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!query.trim()) return;

    const userMsg = { type: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("http://localhost:5000/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      const aiMsg = { type: "ai", text: data.answer };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Error getting response" },
      ]);
    }

    setQuery("");
  };

  return (
    <>
      {/* Floating Button */}
      <div
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl cursor-pointer shadow-lg hover:bg-blue-700 transition z-50"
      >
        💬
      </div>

      {/* Chat Box */}
      {open && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-[450px] bg-white rounded-xl shadow-xl flex flex-col z-50 animate-fadeIn">

          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-xl flex justify-between items-center">
            <span>AI Assistant</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[70%] text-sm ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none"
              placeholder="Ask something..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>

        </div>
      )}
    </>
  );
}
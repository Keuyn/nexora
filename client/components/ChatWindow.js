import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useRouter } from "next/router";
import RatingModal from "./RatingModal";

export default function ChatWindow() {
  const router = useRouter();
  const { theme } = router.query;

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerId, setPartnerId] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [status, setStatus] = useState("Conectando...");
  const [typing, setTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);


  // 🔥 Conexão
  useEffect(() => {
    if (!theme) return;

    const socket = io("http://localhost:3001");
    socketRef.current = socket;


    socket.on("blocked", () => {
  setStatus("⚠️ Você foi bloqueado por má reputação.");
  setConnected(false);
});



    socket.on("connect", () => {
      setStatus("Procurando parceiro...");
      socket.emit("joinTheme", theme);
    });

    socket.on("onlineCount", (count) => {
      setOnlineCount(count);
    });


    socket.on("matched", ({ room, users }) => {
      setRoom(room);

      const partner = users.find(
        (u) => u.socketId !== socket.id
      );

      if (partner) {
        setPartnerId(partner.userId);
      }

      setMessages([]);
      setStatus("Conectado!");
      setConnected(true);
    });

    socket.on("message", ({ text, sender }) => {
      if (!text || !sender) return;

      const isYou = sender === socket.id;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          text,
          sender: isYou ? "you" : "partner",
        },
      ]);
    });

    socket.on("typing", (senderId) => {
      if (senderId !== socket.id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1200);
      }
    });

    socket.on("chatEnded", () => {
      setConnected(false);
      setStatus("Conversa encerrada");
      setShowRating(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [theme]);

  // 🔥 Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim() || !room) return;

    socketRef.current.emit("message", {
      room,
      text: input,
    });

    setInput("");
  }

  function nextUser() {
    if (!theme) return;

    setMessages([]);
    setConnected(false);
    setStatus("Procurando novo parceiro...");
    socketRef.current.emit("joinTheme", theme);
  }

  function endChat() {
    if (!room) return;
    socketRef.current.emit("endChat", room);
  }

  function handleTyping() {
    if (!room) return;
    socketRef.current.emit("typing", room);
  }

  return (
    <div className="container">
      <h2 className="title">Nexora — {theme}</h2>
      <p className="status">{status}</p>

      <div className="chat-box">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`message ${m.sender}`}
          >
            <span className="label">
              {m.sender === "you" ? "VOCÊ" : "ESTRANHO"}
            </span>
            <div>{m.text}</div>
          </div>
        ))}

        {typing && (
          <div className="message partner">
            <em>Estranho está digitando...</em>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {connected && (
        <>
          <div className="input-area">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              placeholder="Digite sua mensagem..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button className="primary" onClick={sendMessage}>
              Enviar
            </button>
          </div>

          <div className="actions">
            <button className="secondary" onClick={nextUser}>
              Próximo
            </button>
            <button className="secondary danger" onClick={endChat}>
              Encerrar
            </button>
          </div>
        
        <p className="online">
  🔥 {onlineCount} pessoas online agora
</p>

        </>
      )}

      {showRating && partnerId && (
        <RatingModal
          partnerId={partnerId}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  );
}

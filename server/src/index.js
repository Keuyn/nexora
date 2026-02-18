const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { addToQueue } = require("./queueManager");

const { ensureUser, updateRating, isBlocked } = require("./ratingManager");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let onlineUsers = 0;


io.on("connection", (socket) => {
  const userId = uuidv4();
  ensureUser(userId);

  console.log("Novo usuário conectado:", socket.id);

onlineUsers++;
io.emit("onlineCount", onlineUsers);


  // 🔥 ENTRAR NA FILA
  socket.on("joinTheme", (theme) => {
    const match = addToQueue(theme, {
      socketId: socket.id,
      socket,
      userId
    });

    if (match) {
      const room = `room-${socket.id}-${match.partner.socketId}`;

    if (isBlocked(userId)) {
  socket.emit("blocked");
  return;
}


      socket.join(room);
      match.partner.socket.join(room);

      io.to(room).emit("matched", {
        room,
        users: [
          { socketId: socket.id, userId },
          { socketId: match.partner.socketId, userId: match.partner.userId }
        ]
      });
    }
  });

  // 🔥 MENSAGEM
  socket.on("message", ({ room, text }) => {
    if (!room || !text) return;

    io.to(room).emit("message", {
      text,
      sender: socket.id
    });
  });

  // 🔥 DIGITANDO
  socket.on("typing", (room) => {
    socket.to(room).emit("typing", socket.id);
  });

  // 🔥 ENCERRAR CHAT
  socket.on("endChat", (room) => {
    io.to(room).emit("chatEnded");
  });

  // 🔥 AVALIAR
  socket.on("rateUser", ({ targetUserId, rating }) => {
    updateRating(targetUserId, rating);
  });

  socket.on("disconnect", () => {
  onlineUsers--;
  io.emit("onlineCount", onlineUsers);
});

});

server.listen(3001, () =>
  console.log("🔥 Nexora server rodando na porta 3001")
);

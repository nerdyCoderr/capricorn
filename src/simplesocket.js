const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to match the origin of your frontend if needed
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for a 'message' event from the client
  socket.on("message", (data) => {
    console.log("Message received from client:", data);

    // Emit the message back to all connected clients
    io.emit("message", data);
  });

  // Listen for the 'disconnect' event
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

const port = 3001;
server.listen(port, () => {
  console.log(`Socket.IO server is running on port ${port}`);
});

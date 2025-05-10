require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./database_connection/connection");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Routes
app.use("/api/users", require("./routers/usersRouting/users"));
app.use("/api/exams", require("./routers/examsRouting/examRouting"));

// Socket: Real-time result handling
const realTimeUpdates = require("./sockets/examsSockets/resultSocket");
realTimeUpdates(io);

// Socket: User messages
const userMessages = require("./sockets/userSockets/messages");
userMessages(io);

// Socket: IP tracking for exams
const ipTracking = require("./sockets/examsSockets/ipTracking");
ipTracking(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

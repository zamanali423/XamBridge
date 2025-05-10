const Conversation = require("../../models/messages/messageModel");

const handleReceiveMessage = async (io, socket, data) => {
  try {
    const { senderId, receiverId, senderName, receiverName, message } = data;

    if (!senderId || !receiverId || !message) {
      console.warn("Missing message fields");
      return;
    }

    const participants = [senderId, receiverId].sort(); // Ensure consistent ordering

    const newMessage = {
      senderId,
      senderName,
      receiverId,
      receiverName,
      message,
      timestamp: new Date(),
    };

    let conversation = await Conversation.findOne({ participants });

    if (!conversation) {
      conversation = new Conversation({
        participants,
        messages: [newMessage],
      });
    } else {
      conversation.messages.push(newMessage);
    }

    await conversation.save();

    const savedMessage =
      conversation.messages[conversation.messages.length - 1];

    // Emit to both participants' rooms (if connected)
    io.to(senderId).emit("receiveMessage", savedMessage); // Sender gets confirmation
    io.to(receiverId).emit("receiveMessage", savedMessage); // Receiver gets the message
  } catch (error) {
    console.error("Error in handleReceiveMessage:", error.message);
  }
};

const handleDisconnect = (socket, onlineUsers, io) => {
  for (const [userId, socketId] of onlineUsers.entries()) {
    if (socket.id === socketId) {
      onlineUsers.delete(userId);
      break;
    }
  }
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  console.log(`Client disconnected: ${socket.id}`);
};

const getMessagesBetweenUsers = async (socket, { senderId, receiverId }) => {
  try {
    const participants = [senderId, receiverId].sort();
    const conversation = await Conversation.findOne({ participants });

    socket.emit("receiveMessages", conversation?.messages || []);
  } catch (error) {
    console.error("Error in getMessagesBetweenUsers:", error.message);
  }
};

const userMessages = (io) => {
  const onlineUsers = new Map();
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room
    socket.on("joinRoom", (userId) => {
      if (!userId) return;
      socket.join(userId);
      console.log(`User ${userId} joined room`);
      onlineUsers.set(userId, socket.id);

      // Broadcast to others that this user is online
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // Listen for sending messages
    socket.on("sendMessage", (data) => {
      handleReceiveMessage(io, socket, data);
    });

    // Fetch past messages
    socket.on("getMessages", (data) => {
      getMessagesBetweenUsers(socket, data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      handleDisconnect(socket, onlineUsers, io);
    });
  });
};

module.exports = userMessages;

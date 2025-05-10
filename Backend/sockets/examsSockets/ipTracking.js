const UserTracking = require("../../models/users/userTracking");

const Tracking = (io) => {
  io.on("connection", (socket) => {
    console.log("📡 Client connected for tracking");

    let userIp = null;

    socket.on("submitIP", ({ userId, ip }) => {
      userIp = ip;
    });

    socket.on("cameraSnapshot", async ({ userId, imageBase64, timestamp }) => {
      try {
        if (!userId || !imageBase64) {
          console.warn("⚠️ Incomplete snapshot data received.");
          return;
        }

        const userTracking = new UserTracking({
          user: userId,
          ip: userIp || "Unknown",
          imageUri: imageBase64,
          lastActive: timestamp || new Date(),
        });

        await userTracking.save();
        console.log(`📸 Snapshot saved for user ${userId}`);

        // Broadcast to all instructors
        io.emit("studentSnapshotUpdate", {
          userId,
          ip: userIp || "Unknown",
          imageBase64,
          timestamp: timestamp || new Date(),
        });
      } catch (error) {
        console.error("❌ Failed to save user tracking data:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected from tracking");
    });
  });
};

module.exports = Tracking;

const Result = require("../../models/exams/resultsModel");

const realTimeUpdates = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected for real-time results");

    // Save a result
    socket.on("addResult", async (data) => {
      try {
        const newResult = new Result({
          title: data?.title,
          totalMarks: data?.totalMarks,
          obtainedMarks: data?.obtainedMarks,
          result: data?.result,
          Timestamp: data?.Timestamp || new Date(),
          email: data?.email,
          examId: data?.examId,
          timeTaken: data?.timeTaken,
        });

        const savedResult = await newResult.save();
        
        socket.emit("computeResult", savedResult);
        console.log("Result saved and emitted to client.");
      } catch (error) {
        console.error("Error saving result:", error);
        socket.emit("error", { message: "Failed to save result" });
      }
    });

    // Fetch results by email
    socket.on("getAllResults", async (email) => {
      try {
        const results = await Result.find({ email });

        if (!results || results.length === 0) {
          socket.emit("showResults", []);
          console.warn(`No results found for email: ${email}`);
        } else {
          socket.emit("showResults", results);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        socket.emit("error", { message: "Failed to fetch results" });
      }
    });

    // Client disconnects
    socket.on("disconnect", () => {
      console.log("Client disconnected from result updates.");
    });
  });
};

module.exports = realTimeUpdates;

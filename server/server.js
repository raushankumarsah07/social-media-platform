require("dotenv").config();
require("express-async-errors"); // lets async route handlers throw into the error handler
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "https://social-media-platform-gules-kappa.vercel.app",
  }),
);
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/posts", require("./routes/posts"));

app.use((req, res) => res.status(404).json({ message: "Route not found." }));

// Central error handler
app.use((err, req, res, next) => {
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid id." });
  if (err.code === 11000)
    return res.status(409).json({ message: "Already exists." });
  console.error(err);
  res.status(500).json({ message: "Something went wrong on our side." });
});

const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  const server = app.listen(PORT, () =>
    console.log(`API running on http://localhost:${PORT}`),
  );
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Set PORT to another value and restart.`,
      );
    } else {
      console.error("Server failed to start:", err.message);
    }
    process.exit(1);
  });
});

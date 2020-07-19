const { config } = require("dotenv");
config();
const express = require("express");
const useMiddleWares = require("./config/use-middleWares");
const connectMongoDb = require('./config/mongoose');

const app = express();
const { PORT } = process.env;

// Connect mongoDb
connectMongoDb();

// Use middleWares
useMiddleWares(app);

// Use Routes
app.use("/api/auth", require("./routes/users.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/post", require("./routes/post.routes"));

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
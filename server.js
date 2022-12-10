require("dotenv").config();

const fs = require("fs");
const app = require("express")();
const port = process.env.port || 8095;

var options = {
  key: fs.readFileSync(process.env.privateKey, "utf8"),
  cert: fs.readFileSync(process.env.certificate, "utf8"),
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

ssl = http = require(process.env.http).createServer(options, app);
http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
});

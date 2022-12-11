import express from "./node_modules/express";
import RTCMultiConnectionServer from "./node_modules/rtcmulticonnection-server";
import dotenv from "./node_modules/dotenv";
import * as fs from "fs";
const ioServer = require("socket.io");

dotenv.config();

const app = express();
const port = process.env.port || 8095;
app.use(express.static("public"));
app.use("node_modules", express.static("node_modules"));

const getValuesFromConfigJson =
  RTCMultiConnectionServer.getValuesFromConfigJson;

const jsonPath = {
  config: ".env",
  logs: "logs.json",
};

var options = {
  key: fs.readFileSync(process.env.privateKey, "utf8"),
  cert: fs.readFileSync(process.env.certificate, "utf8"),
};

var config = getValuesFromConfigJson(jsonPath);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// const http = process.env.http;
httpServer = require("http").createServer(options, app);
RTCMultiConnectionServer.beforeHttpListen(httpServer, config);

httpServer = httpServer.listen(port, process.env.IP || "0.0.0.0", () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
  RTCMultiConnectionServer.afterHttpListen(httpServer, config);
});

ioServer(httpServer).on("connection", (socket) => {
  // socket.on("chat message", (msg) => {
  //   io.emit("chat message", msg);
  // });
  RTCMultiConnectionServer.addSocket(socket, config);
  console.log("server started on socket " + socket);

  // ----------------------
  // below code is optional

  const params = socket.handshake.query;

  if (!params.socketCustomEvent) {
    params.socketCustomEvent = "custom-message";
  }

  socket.on(params.socketCustomEvent, function (message) {
    socket.broadcast.emit(params.socketCustomEvent, message);
  });
});

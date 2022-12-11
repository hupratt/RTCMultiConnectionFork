require("dotenv").config();
const express = require("express");
const path = require("path");

const fs = require("fs");
const app = require("express")();
const port = process.env.port || 8095;
const RTCMultiConnectionServer = require("rtcmulticonnection-server");
app.use(express.static("public"));
app.use("node_modules", express.static("node_modules"));

const BASH_COLORS_HELPER = RTCMultiConnectionServer.BASH_COLORS_HELPER;
const getValuesFromConfigJson =
  RTCMultiConnectionServer.getValuesFromConfigJson;
const getBashParameters = RTCMultiConnectionServer.getBashParameters;
const resolveURL = RTCMultiConnectionServer.resolveURL;

const jsonPath = {
  config: "config.json",
  logs: "logs.json",
};

var options = {
  key: fs.readFileSync(process.env.privateKey, "utf8"),
  cert: fs.readFileSync(process.env.certificate, "utf8"),
};

var config = getValuesFromConfigJson(jsonPath);
config = getBashParameters(config, BASH_COLORS_HELPER);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/live/index.html");
});

http = require(process.env.http).createServer(options, app);
RTCMultiConnectionServer.beforeHttpListen(http, config);

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
  RTCMultiConnectionServer.afterHttpListen(http, config);
});
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });
  RTCMultiConnectionServer.addSocket(socket, config);

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

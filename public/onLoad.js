window.addEventListener("load", function () {
  // ......................................................
  // .......................UI Code........................
  // ......................................................
  document.getElementById("open-room").onclick = function () {
    console.log("open-room button clicked");
    disableInputButtons();
    console.log(document.getElementById("room-id").value + " room-id clicked");
    connection.open(
      document.getElementById("room-id").value,
      function (isRoomOpened, roomid, error) {
        console.log("isRoomOpened " + isRoomOpened);
        if (isRoomOpened === true) {
          showRoomURL(connection.sessionid);
          console.log("showRoomURL");
        } else {
          disableInputButtons(true);
          if (error === "Room not available") {
            alert(
              "Someone already created this room. Please either join or create a separate room."
            );
            return;
          }
          alert(error);
        }
      }
    );
  };

  document.getElementById("add-screen").onclick = function () {
    disableInputButtons();
    connection.open(document.getElementById("room-id").value, () => {
      createRTCMultiConnection();
    });
  };

  document.getElementById("join-room").onclick = function () {
    console.log("join-room button clicked");
    disableInputButtons();
    console.log(document.getElementById("room-id").value + " room-id clicked");
    connection.join(
      document.getElementById("room-id").value,
      function (isJoinedRoom, roomid, error) {
        if (error) {
          disableInputButtons(true);
          if (error === "Room not available") {
            alert(
              "This room does not exist. Please either create it or wait for moderator to enter in the room."
            );
            return;
          }
          alert(error);
        }
      }
    );
  };

  document.getElementById("open-or-join-room").onclick = function () {
    console.log("open-or-join-room button clicked");
    disableInputButtons();
    console.log(document.getElementById("open-or-join-room"));
    console.log(document.getElementById("room-id").value);
    connection.openOrJoin(
      document.getElementById("room-id").value,
      function (isRoomExist, roomid, error) {
        if (error) {
          disableInputButtons(true);
          alert(error);
        } else if (connection.isInitiator === true) {
          // if room doesn't exist, it means that current user will create the room
          showRoomURL(roomid);
        }
        // if (isRoomExist) {
        //   connection.sdpConstraints.mandatory = {
        //     OfferToReceiveAudio: false,
        //     OfferToReceiveVideo: true,
        //   };
        // }
      }
    );
  };

  // ......................................................
  // ..................RTCMultiConnection Code.............
  // ......................................................
  const createRTCMultiConnection = () => {
    var connection = new RTCMultiConnection();
    // by default, socket.io server is assumed to be deployed on your own URL
    connection.socketURL = "/";
    console.log("RTCMultiConnection " + connection.token());
    // comment-out below line if you do not have your own socket.io server
    // connection.socketURL = 'https://muazkhan.com:9001/';

    connection.socketMessageEvent = "video-screen-demo";

    connection.session = {
      screen: true,
      oneway: true,
      audio: true,
      video: true,
    };

    connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true,
    };
    // STAR_FIX_VIDEO_AUTO_PAUSE_ISSUES
    // via: https://github.com/muaz-khan/RTCMultiConnection/issues/778#issuecomment-524853468
    var bitrates = 512;
    var resolutions = "Ultra-HD";
    var videoConstraints = {};

    if (resolutions == "HD") {
      videoConstraints = {
        width: {
          ideal: 1280,
        },
        height: {
          ideal: 720,
        },
        frameRate: 30,
      };
    }

    if (resolutions == "Ultra-HD") {
      videoConstraints = {
        width: {
          ideal: 1920,
        },
        height: {
          ideal: 1080,
        },
        frameRate: 30,
      };
    }

    connection.mediaConstraints = {
      video: videoConstraints,
      audio: true,
    };

    var CodecsHandler = connection.CodecsHandler;

    connection.processSdp = function (sdp) {
      var codecs = "vp8";

      if (codecs.length) {
        sdp = CodecsHandler.preferCodec(sdp, codecs.toLowerCase());
      }

      if (resolutions == "HD") {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
          audio: 128,
          video: bitrates,
          screen: bitrates,
        });

        sdp = CodecsHandler.setVideoBitrates(sdp, {
          min: bitrates * 8 * 1024,
          max: bitrates * 8 * 1024,
        });
      }

      if (resolutions == "Ultra-HD") {
        sdp = CodecsHandler.setApplicationSpecificBandwidth(sdp, {
          audio: 128,
          video: bitrates,
          screen: bitrates,
        });

        sdp = CodecsHandler.setVideoBitrates(sdp, {
          min: bitrates * 8 * 1024,
          max: bitrates * 8 * 1024,
        });
      }

      return sdp;
    };
    // END_FIX_VIDEO_AUTO_PAUSE_ISSUES

    // https://www.rtcmulticonnection.org/docs/iceServers/
    // use your own TURN-server here!
    connection.iceServers = [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun.l.google.com:19302?transport=udp",
        ],
      },
    ];
    console.log(connection.iceServers[0]);

    connection.videosContainer = document.getElementById("videos-container");
    console.log(connection.videosContainer.id + " found");
    connection.onstream = function (event) {
      console.log("onstream " + event.streamid);
      var existing = document.getElementById(event.streamid);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }

      event.mediaElement.removeAttribute("src");
      event.mediaElement.removeAttribute("srcObject");
      event.mediaElement.muted = true;
      event.mediaElement.volume = 0;

      var video = document.createElement("video");

      try {
        video.setAttributeNode(document.createAttribute("autoplay"));
        video.setAttributeNode(document.createAttribute("playsinline"));
      } catch (e) {
        video.setAttribute("autoplay", true);
        video.setAttribute("playsinline", true);
      }

      if (event.type === "local") {
        video.volume = 0;
        try {
          video.setAttributeNode(document.createAttribute("muted"));
        } catch (e) {
          video.setAttribute("muted", true);
        }
      }
      video.srcObject = event.stream;

      var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
      var mediaElement = getHTMLMediaElement(video, {
        title: event.userid,
        buttons: ["full-screen"],
        width: width,
        showOnMouseEnter: false,
      });

      connection.videosContainer.appendChild(mediaElement);
      console.log("mediaElement");

      setTimeout(function () {
        mediaElement.media.play();
      }, 5000);

      mediaElement.id = event.streamid;

      // to keep room-id in cache
      localStorage.setItem(connection.socketMessageEvent, connection.sessionid);

      chkRecordConference.parentNode.style.display = "none";

      if (chkRecordConference.checked === true) {
        btnStopRecording.style.display = "inline-block";
        recordingStatus.style.display = "inline-block";

        var recorder = connection.recorder;
        if (!recorder) {
          recorder = RecordRTC([event.stream], {
            type: "video",
          });
          recorder.startRecording();
          connection.recorder = recorder;
        } else {
          recorder.getInternalRecorder().addStreams([event.stream]);
        }

        if (!connection.recorder.streams) {
          connection.recorder.streams = [];
        }

        connection.recorder.streams.push(event.stream);
        recordingStatus.innerHTML =
          "Recording " + connection.recorder.streams.length + " streams";
      }

      if (event.type === "local") {
        connection.socket.on("disconnect", function () {
          if (!connection.getAllParticipants().length) {
            location.reload();
          }
        });
      }
    };

    var recordingStatus = document.getElementById("recording-status");
    var chkRecordConference = document.getElementById(
      "record-entire-conference"
    );
    var btnStopRecording = document.getElementById("btn-stop-recording");
    btnStopRecording.onclick = function () {
      var recorder = connection.recorder;
      if (!recorder) return alert("No recorder found.");
      recorder.stopRecording(function () {
        var blob = recorder.getBlob();
        invokeSaveAsDialog(blob);

        connection.recorder = null;
        btnStopRecording.style.display = "none";
        recordingStatus.style.display = "none";
        chkRecordConference.parentNode.style.display = "inline-block";
      });
    };

    connection.onstreamended = function (event) {
      var mediaElement = document.getElementById(event.streamid);
      if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
      }
    };

    connection.onMediaError = function (e) {
      if (e.message === "Concurrent mic process limit.") {
        if (DetectRTC.audioInputDevices.length <= 1) {
          alert(
            "Please select external microphone. Check github issue number 483."
          );
          return;
        }

        var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
        connection.mediaConstraints.audio = {
          deviceId: secondaryMic,
        };

        connection.join(connection.sessionid);
      }
    };

    // ......................................................
    // ......................Handling Room-ID................
    // ......................................................

    (function () {
      var params = {},
        r = /([^&=]+)=?([^&]*)/g;

      function d(s) {
        return decodeURIComponent(s.replace(/\+/g, " "));
      }
      var match,
        search = window.location.search;
      while ((match = r.exec(search.substring(1))))
        params[d(match[1])] = d(match[2]);
      window.params = params;
    })();

    var roomid = "";
    if (localStorage.getItem(connection.socketMessageEvent)) {
      roomid = localStorage.getItem(connection.socketMessageEvent);
    } else {
      roomid = connection.token();
    }

    var txtRoomId = document.getElementById("room-id");
    txtRoomId.value = roomid;
    txtRoomId.onkeyup =
      txtRoomId.oninput =
      txtRoomId.onpaste =
        function () {
          localStorage.setItem(
            connection.socketMessageEvent,
            document.getElementById("room-id").value
          );
        };

    var hashString = location.hash.replace("#", "");
    if (hashString.length && hashString.indexOf("comment-") == 0) {
      hashString = "";
    }

    var roomid = params.roomid;
    if (!roomid && hashString.length) {
      roomid = hashString;
    }

    if (roomid && roomid.length) {
      document.getElementById("room-id").value = roomid;
      localStorage.setItem(connection.socketMessageEvent, roomid);

      // auto-join-room
      (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function (isRoomExist) {
          if (isRoomExist) {
            connection.join(roomid);
            return;
          }

          setTimeout(reCheckRoomPresence, 5000);
        });
      })();

      disableInputButtons();
    }

    // detect 2G
    if (
      navigator.connection &&
      navigator.connection.type === "cellular" &&
      navigator.connection.downlinkMax <= 0.115
    ) {
      alert("2G is not supported. Please use a better internet service.");
    }
    return connection;
  };
  var connection = createRTCMultiConnection();
  function disableInputButtons(enable) {
    document.getElementById("room-id").onkeyup();
    document.getElementById("open-or-join-room").disabled = !enable;
    document.getElementById("open-room").disabled = !enable;
    document.getElementById("join-room").disabled = !enable;
    document.getElementById("room-id").disabled = !enable;
  }
  function showRoomURL(roomid) {
    var roomHashURL = "#" + roomid;
    var roomQueryStringURL = "?roomid=" + roomid;

    var html = "<h2>Unique URL for your room:</h2><br>";

    html +=
      'Hash URL: <a href="' +
      roomHashURL +
      '" target="_blank">' +
      roomHashURL +
      "</a>";
    html += "<br>";
    html +=
      'QueryString URL: <a href="' +
      roomQueryStringURL +
      '" target="_blank">' +
      roomQueryStringURL +
      "</a>";

    var roomURLsDiv = document.getElementById("room-urls");
    roomURLsDiv.innerHTML = html;

    roomURLsDiv.style.display = "block";
  }
});

"use strict";
var path = require("path");
var { drawConnectors, drawLandmarks } = require("@mediapipe/drawing_utils");
var { Pose, POSE_CONNECTIONS, POSE_LANDMARKS } = require("@mediapipe/pose");
var { ipcRenderer } = require("electron");
var { runGameFrame, setCanvasCtx } = require("../../pages/game/games.js");
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
setCanvasCtx(canvasCtx);
function onResults(results) {
    runGameFrame(results);
}
const pose = new Pose({
    locateFile: (file) => {
        return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
    },
});
pose.setOptions({
    selfieMode: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.25,
    minTrackingConfidence: 0.25,
});
pose.onResults(onResults);
let stream = null;
async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1080 },
                height: { ideal: 720 },
            },
        });
        videoElement.srcObject = stream;
        videoElement.play();
    }
    catch (error) {
        console.error("Error accessing webcam:", error);
    }
    setCanvasCtx(canvasCtx);
}
const runFrame = async () => {
    setCanvasCtx(canvasCtx);
    await pose.send({ image: videoElement });
    videoElement.requestVideoFrameCallback(runFrame);
};
videoElement.requestVideoFrameCallback(runFrame);
function stopWebcam() {
    if (stream) {
        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());
        videoElement.srcObject = null; // Optionally clear the video source
    }
}
ipcRenderer.on("start-web-game", () => {
    var _a;
    setCanvasCtx(canvasCtx);
    startWebcam();
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
});
ipcRenderer.on("stop-web-game", () => {
    var _a;
    stopWebcam();
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
});

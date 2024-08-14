"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const pose_1 = require("@mediapipe/pose");
const electron_1 = require("electron");
const games_1 = require("../../pages/game/games");
const videoElement = document.getElementById("input_video");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
(0, games_1.setCanvasCtx)(canvasCtx);
function onResults(results) {
    (0, games_1.runGameFrame)(results);
}
const pose = new pose_1.Pose({
    locateFile: (file) => {
        return path_1.default.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
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
let stream;
async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1080 },
                height: { ideal: 720 },
            },
        });
        videoElement.srcObject = stream;
        await videoElement.play();
    }
    catch (error) {
        console.error("Error accessing webcam:", error);
    }
    (0, games_1.setCanvasCtx)(canvasCtx);
}
const runFrame = async () => {
    (0, games_1.setCanvasCtx)(canvasCtx);
    await pose.send({ image: videoElement });
    videoElement.requestVideoFrameCallback(runFrame);
};
function stopWebcam() {
    if (stream)
        stream.getTracks().forEach((track) => track.stop());
    stream = null;
}
async function startWebGame() {
    var _a;
    (0, games_1.setCanvasCtx)(canvasCtx);
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    await startWebcam();
    videoElement.requestVideoFrameCallback(runFrame);
}
function stopWebGame() {
    var _a;
    videoElement.requestVideoFrameCallback(() => { });
    stopWebcam();
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
electron_1.ipcRenderer.on("start-web-game", () => {
    startWebGame();
});
electron_1.ipcRenderer.on("stop-web-game", () => {
    stopWebGame();
});

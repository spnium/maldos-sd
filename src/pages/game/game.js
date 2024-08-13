"use strict";
// var path = require("path");
// var { drawConnectors, drawLandmarks } = require("@mediapipe/drawing_utils");
// var { Pose, POSE_CONNECTIONS, POSE_LANDMARKS } = require("@mediapipe/pose");
// var { ipcRenderer } = require("electron");
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// var { runGameFrame, setCanvasCtx } = require("../../pages/game/games.js");
const path = __importStar(require("path"));
const pose_1 = require("@mediapipe/pose");
const electron_1 = require("electron");
const games_1 = require("../../pages/game/games");
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
(0, games_1.setCanvasCtx)(canvasCtx);
function onResults(results) {
    (0, games_1.runGameFrame)(results);
}
const pose = new pose_1.Pose({
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
    (0, games_1.setCanvasCtx)(canvasCtx);
}
const runFrame = async () => {
    (0, games_1.setCanvasCtx)(canvasCtx);
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
electron_1.ipcRenderer.on("start-web-game", () => {
    var _a;
    (0, games_1.setCanvasCtx)(canvasCtx);
    startWebcam();
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
});
electron_1.ipcRenderer.on("stop-web-game", () => {
    var _a;
    stopWebcam();
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
});

"use strict";
// import path from "path";
// import { Pose, Results } from "@mediapipe/pose";
// import { ipcRenderer } from "electron";
// import { runGameFrame, setCanvasCtx } from "../../pages/game/games";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var { Pose, Results } = require("@mediapipe/pose");
var { ipcRenderer } = require("electron");
var { runGameFrame, setCanvasCtx } = require("../../pages/game/games");
var videoElement = document.getElementById("input_video");
var canvasElement = document.getElementById("output_canvas");
var canvasCtx = canvasElement.getContext("2d");
var pose = new Pose({
    locateFile: (file) => {
        return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
    },
});
ipcRenderer.on("start-web-game", () => {
    try {
        setCanvasCtx(canvasCtx);
        startWebGame();
        function onResults(results) {
            runGameFrame(results);
        }
        pose = new Pose({
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
            }
            catch (error) {
                console.error("Error accessing webcam:", error);
            }
            setCanvasCtx(canvasCtx);
            await videoElement.play();
        }
        const runFrame = async () => {
            setCanvasCtx(canvasCtx);
            await pose.send({ image: videoElement });
            videoElement.requestVideoFrameCallback(runFrame);
        };
        function stopWebcam() {
            if (stream)
                stream.getTracks().forEach((track) => track.stop());
            stream = null;
            return;
        }
        async function startWebGame() {
            var _a;
            setCanvasCtx(canvasCtx);
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
        ipcRenderer.on("start-web-game", () => {
            startWebGame();
        });
        ipcRenderer.on("stop-web-game", () => {
            stopWebGame();
        });
    }
    catch (error) {
        console.error(error);
    }
});

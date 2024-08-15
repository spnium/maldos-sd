"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import path from "path";
const pose_1 = require("@mediapipe/pose");
const electron_1 = require("electron");
// import { runGameFrame, setCanvasCtx } from "../../pages/game/games";
// var { ipcRenderer } = require("electron");
// var { Pose } = require("@mediapipe/pose");
electron_1.ipcRenderer.on("start-web-game", () => {
    try {
        var path = require("path");
        var { runGameFrame, setCanvasCtx } = require("../../pages/game/games");
        var videoElement = document.getElementById("input_video");
        var canvasElement = document.getElementById("output_canvas");
        var canvasCtx = canvasElement.getContext("2d");
        var pose = new pose_1.Pose({
            locateFile: (file) => {
                return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
            },
        });
        setCanvasCtx(canvasCtx);
        startWebGame();
        function onResults(results) {
            runGameFrame(results);
        }
        pose = new pose_1.Pose({
            locateFile: (file) => {
                return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
            },
        });
        pose.setOptions({
            selfieMode: true,
            modelComplexity: 2,
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
                setTimeout(async () => {
                    await videoElement.play();
                }, 100);
            }
            catch (error) {
                console.error("Error accessing webcam:", error);
                console.log(error);
            }
            setCanvasCtx(canvasCtx);
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
        module.exports = {
            stopWebGame,
        };
        // ipcRenderer.on("start-web-game", () => {
        // 	startWebGame();
        // });
        electron_1.ipcRenderer.on("stop-web-game", () => {
            stopWebGame();
            return;
        });
    }
    catch (error) {
        console.error(error);
    }
});

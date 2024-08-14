"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var { ipcRenderer } = require("electron");
ipcRenderer.on("start-web-game", async () => {
    var { Pose } = require("@mediapipe/pose");
    var { runGameFrame, setCanvasCtx } = require("../../pages/game/games");
    var path = require("path");
    var videoElement = document.getElementById("input_video");
    var canvasElement = document.getElementById("output_canvas");
    var canvasCtx = canvasElement.getContext("2d");
    setCanvasCtx(canvasCtx);
    function onResults(results) {
        runGameFrame(results);
    }
    const pose = new Pose({
        locateFile: (file) => {
            return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
        },
    });
    await pose.initialize();
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
    function setScores(scores) {
        ipcRenderer.send("set-scores", scores);
    }
    // ipcRenderer.on("start-web-game", () => {
    // 	startWebGame();
    // });
    startWebGame();
    ipcRenderer.on("stop-web-game", () => {
        stopWebGame();
        return;
    });
});

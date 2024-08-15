// import path from "path";
import { Pose, Results } from "@mediapipe/pose";
import { ipcRenderer } from "electron";
// import { runGameFrame, setCanvasCtx } from "../../pages/game/games";
// var { ipcRenderer } = require("electron");
// var { Pose } = require("@mediapipe/pose");

ipcRenderer.on("start-web-game", () => {
	try {
		var path = require("path");
		var { runGameFrame, setCanvasCtx } = require("../../pages/game/games");

		var videoElement = document.getElementById("input_video") as HTMLVideoElement;
		var canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
		var canvasCtx = canvasElement.getContext("2d") as CanvasRenderingContext2D;

		var pose = new Pose({
			locateFile: (file: string) => {
				return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
			},
		});

		setCanvasCtx(canvasCtx);
		startWebGame();

		function onResults(results: any) {
			runGameFrame(results);
		}

		pose = new Pose({
			locateFile: (file: string) => {
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

		let stream: MediaStream | null;

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
			} catch (error) {
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
			if (stream) stream.getTracks().forEach((track) => track.stop());
			stream = null;
			return;
		}

		async function startWebGame() {
			setCanvasCtx(canvasCtx);
			document.getElementById("listgamehidden")?.classList.remove("hidden");
			await startWebcam();
			videoElement.requestVideoFrameCallback(runFrame);
		}

		function stopWebGame() {
			videoElement.requestVideoFrameCallback(() => {});
			stopWebcam();
			document.getElementById("listgamehidden")?.classList.add("hidden");
		}

		module.exports = {
			stopWebGame,
		};

		// ipcRenderer.on("start-web-game", () => {
		// 	startWebGame();
		// });

		ipcRenderer.on("stop-web-game", () => {
			stopWebGame();
			return;
		});
	} catch (error) {
		console.error(error);
	}
});
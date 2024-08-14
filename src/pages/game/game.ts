import path from "path";
import { Pose, Results } from "@mediapipe/pose";
import { ipcRenderer } from "electron";
import { runGameFrame, setCanvasCtx } from "../../pages/game/games";

const videoElement = document.getElementById("input_video") as HTMLVideoElement;
const canvasElement = document.getElementById("output_canvas") as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d") as CanvasRenderingContext2D;

setCanvasCtx(canvasCtx);

function onResults(results: Results) {
	runGameFrame(results);
}

const pose = new Pose({
	locateFile: (file: string) => {
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
		await videoElement.play();
	} catch (error) {
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
	if (stream) stream.getTracks().forEach((track) => track.stop());
	stream = null;
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

ipcRenderer.on("start-web-game", () => {
	startWebGame();
});

ipcRenderer.on("stop-web-game", () => {
	stopWebGame();
});

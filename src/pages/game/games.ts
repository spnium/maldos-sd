import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { POSE_CONNECTIONS } from "@mediapipe/pose";
import { Star, width, height } from "../../pages/game/utils";
var ElectronStore = require("electron-store");
var { ipcRenderer } = require("electron");

var store = new ElectronStore();

import * as Pose1 from "../../pages/game/poses/pose1";
import * as Pose2 from "../../pages/game/poses/pose2";
import * as Pose3 from "../../pages/game/poses/pose3";
import * as Pose4 from "../../pages/game/poses/pose4";

let pose1 = {
	starsArray: [Pose1.poseStars],
	setCoordinates: Pose1.setposeCoordinates,
	setCanvasCtx: Pose1.setposeCanvasCtx,
};

let pose2 = {
	starsArray: [Pose2.poseRstars, Pose2.poseLstars],
	setCoordinates: Pose2.setposeCoordinates,
	setCanvasCtx: Pose2.setposeCanvasCtx,
};

let pose3 = {
	starsArray: [Pose3.poseRStars, Pose3.poseLStars],
	setCoordinates: Pose3.setposeCoordinates,
	setCanvasCtx: Pose3.setposeCanvasCtx,
};

let pose4 = {
	starsArray: [Pose4.poseRStars, Pose4.poseLStars],
	setCoordinates: Pose4.setposeCoordinates,
	setCanvasCtx: Pose4.setposeCanvasCtx,
};

let poses = [pose1, pose2, pose3, pose4];

let poseStars: Star[] = [];
let setPoseCanvasCtxs: ((ctx: CanvasRenderingContext2D) => void)[] = [];
let setPosePoseCoordinates: ((coordinates: number[][]) => void)[] = [];

poses.forEach((pose) => {
	pose.starsArray.forEach((starArray: any) => {
		poseStars.push(starArray);
	});
	setPoseCanvasCtxs.push(pose.setCanvasCtx);
	setPosePoseCoordinates.push(pose.setCoordinates);
});

function setScores(scores: number[]) {
	ipcRenderer.send("set-scores", scores);
}

let canvasCtx: CanvasRenderingContext2D;
let poseCoordinates: number[][] = [];
for (let i = 0; i < 33; i++) {
	poseCoordinates[i] = [0, 0];
}

function setCanvasCtx(ctx: CanvasRenderingContext2D) {
	canvasCtx = ctx;
	setPoseCanvasCtxs.forEach((setPoseCanvasCtx) => {
		setPoseCanvasCtx(ctx);
	});
}

function formatTime(time: number) {
	if (time === 0) {
		return "00:00:00";
	}

	let minutes: number | string = Math.floor(time / 60);
	let seconds: number | string = Math.floor((time % 3600) % 60);

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}
	if (seconds < 10) {
		seconds = `0${seconds}`;
	}

	return `${minutes}:${seconds}`;
}

let startTime = -1000;
let timeLimit = 301;
let timeLeft = timeLimit;
let timeStr = formatTime(timeLeft);

let poseNum = 0;
let previousPoseNum = 0;
let scores = store.get("scores") || [0, 0, 0, 0, 0, 0];
console.log(scores);

let poseNames = [
	"ท่าที่ 1",
	"ท่าที่ 2 - ด้านขวา",
	"ท่าที่ 2 - ด้านซ้าย",
	"ท่าที่ 3 - ด้านขวา",
	"ท่าที่ 3 - ด้านซ้าย",
	"ท่าที่ 4 - ด้านขวา",
	"ท่าที่ 4 - ด้านซ้าย",
	"ท่าที่ 5 - ด้านขวา",
	"ท่าที่ 5 - ด้านซ้าย",
	"ท่าที่ 6 - ด้านขวา",
	"ท่าที่ 6 - ด้านซ้าย",
];
function drawPoseName(nameNum: number) {
	canvasCtx.font = "50px Arial";
	canvasCtx.textAlign = "center";
	canvasCtx.textBaseline = "top";
	canvasCtx.fillStyle = "black";
	canvasCtx.fillText(poseNames[nameNum], width / 2 - 50, 0);
}

function runGameFrame(results: any) {
	if (startTime == -1000) {
		startTime = Date.now();
	}

	timeLeft = parseInt(`${timeLimit - (Date.now() - startTime) / 1000}`);

	timeStr = formatTime(timeLeft);

	canvasCtx.clearRect(0, 0, width, height);

	canvasCtx.drawImage(results.image, 0, 0, width, height);

	canvasCtx.font = "50px Arial";
	canvasCtx.textAlign = "end";
	canvasCtx.textBaseline = "top";
	canvasCtx.fillStyle = "red";
	canvasCtx.fillText(timeStr, width - 20, 0);

	if (!results.poseLandmarks) {
		return;
	}

	drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
		color: "#00FF00",
		lineWidth: 4,
	});
	drawLandmarks(canvasCtx, results.poseLandmarks, { color: "#FF0000", lineWidth: 2 });

	poseCoordinates = [];
	results.poseLandmarks.forEach((landmark: any) => {
		poseCoordinates.push([landmark.x * width, landmark.y * height]);
	});

	setPosePoseCoordinates.forEach((setPosePoseCoordinate) => {
		setPosePoseCoordinate(poseCoordinates);
	});

	poseNum = 0;
	for (let i = 0; i < poseStars.length; i++) {
		if (
			(poseStars[i] as any).every(
				(star: Star) => star.permanentlyActive || !star.hasPermanentlyActiveTimer
			)
		) {
			poseNum += 1;
		} else {
			break;
		}
	}

	if (poseNum != previousPoseNum && poseNum > 0) {
		for (let i = 0; i < poseNum - 1; i++) {
			scores[i] = 3;
		}

		setScores(scores);
		previousPoseNum = poseNum;
	}

	drawPoseName(poseNum);

	(poseStars[poseNum] as any).forEach((star: Star) => {
		star.runAll();
	});

	if (timeLeft <= 0) {
		canvasCtx.clearRect(0, 0, width, height);
		canvasCtx.font = "150px Arial";
		canvasCtx.textAlign = "center";
		canvasCtx.textBaseline = "top";
		canvasCtx.fillStyle = "red";
		canvasCtx.fillText("เกมจบ", width / 2 - 150, height / 2 - 150);

		if (poseNum > 0) {
			for (let i = 0; i < poseNum - 1; i++) {
				scores[i] = 3;
			}

			scores[poseNum - 1] = 2;

			setScores(scores);
			previousPoseNum = poseNum;
		}

		return;
	}
}

module.exports = {
	runGameFrame,
	setCanvasCtx,
};

export { runGameFrame, setCanvasCtx };
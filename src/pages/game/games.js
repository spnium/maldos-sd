"use strict";
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
exports.runGameFrame = runGameFrame;
exports.setCanvasCtx = setCanvasCtx;
const drawing_utils_1 = require("@mediapipe/drawing_utils");
const pose_1 = require("@mediapipe/pose");
const utils_1 = require("../../pages/game/utils");
const Pose1 = __importStar(require("../../pages/game/poses/pose1"));
const Pose2 = __importStar(require("../../pages/game/poses/pose2"));
const Pose3 = __importStar(require("../../pages/game/poses/pose3"));
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
let poses = [pose1, pose2, pose3];
let poseStars = [];
let setPoseCanvasCtxs = [];
let setPosePoseCoordinates = [];
poses.forEach((pose) => {
    pose.starsArray.forEach((starArray) => {
        poseStars.push(starArray);
    });
    setPoseCanvasCtxs.push(pose.setCanvasCtx);
    setPosePoseCoordinates.push(pose.setCoordinates);
});
let canvasCtx;
let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [0, 0];
}
function setCanvasCtx(ctx) {
    canvasCtx = ctx;
    setPoseCanvasCtxs.forEach((setPoseCanvasCtx) => {
        setPoseCanvasCtx(ctx);
    });
}
function formatTime(time) {
    if (time === 0) {
        return "00:00:00";
    }
    let minutes = Math.floor(time / 60);
    let seconds = Math.floor((time % 3600) % 60);
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
let poseNames = [
    "ท่าที่ 1",
    "ท่าที่ 2 - ด้านขวา",
    "ท่าที่ 2 - ด้านซ้าย",
    "ท่าที่ 3 - ด้านขวา",
    "ท่าที่ 3 - ด้านซ้าย",
    "ท่าที่ 4 - ด้านซ้าย",
    "ท่าที่ 4 - ด้านขวา",
    "ท่าที่ 5 - ด้านซ้าย",
    "ท่าที่ 5 - ด้านขวา",
    "ท่าที่ 6 - ด้านซ้าย",
    "ท่าที่ 6 - ด้านขวา",
];
function drawPoseName(nameNum) {
    canvasCtx.font = "50px Arial";
    canvasCtx.textAlign = "center";
    canvasCtx.textBaseline = "top";
    canvasCtx.fillStyle = "black";
    canvasCtx.fillText(poseNames[nameNum], utils_1.width / 2 - 50, 0);
}
function runGameFrame(results) {
    if (startTime == -1000) {
        startTime = Date.now();
    }
    timeLeft = parseInt(`${timeLimit - (Date.now() - startTime) / 1000}`);
    timeStr = formatTime(timeLeft);
    canvasCtx.clearRect(0, 0, utils_1.width, utils_1.height);
    canvasCtx.drawImage(results.image, 0, 0, utils_1.width, utils_1.height);
    canvasCtx.font = "50px Arial";
    canvasCtx.textAlign = "end";
    canvasCtx.textBaseline = "top";
    canvasCtx.fillStyle = "red";
    canvasCtx.fillText(timeStr, utils_1.width - 20, 0);
    if (!results.poseLandmarks) {
        return;
    }
    (0, drawing_utils_1.drawConnectors)(canvasCtx, results.poseLandmarks, pose_1.POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 4,
    });
    (0, drawing_utils_1.drawLandmarks)(canvasCtx, results.poseLandmarks, { color: "#FF0000", lineWidth: 2 });
    poseCoordinates = [];
    results.poseLandmarks.forEach((landmark) => {
        poseCoordinates.push([landmark.x * utils_1.width, landmark.y * utils_1.height]);
    });
    setPosePoseCoordinates.forEach((setPosePoseCoordinate) => {
        setPosePoseCoordinate(poseCoordinates);
    });
    poseNum = 0;
    for (let i = 0; i < poseStars.length; i++) {
        if (poseStars[i].every((star) => star.permanentlyActive || !star.hasPermanentlyActiveTimer)) {
            poseNum += 1;
        }
        else {
            break;
        }
    }
    drawPoseName(poseNum);
    poseStars[poseNum].forEach((star) => {
        star.runAll();
    });
    if (timeLeft <= 0) {
        canvasCtx.clearRect(0, 0, utils_1.width, utils_1.height);
        canvasCtx.font = "150px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.textBaseline = "top";
        canvasCtx.fillStyle = "red";
        canvasCtx.fillText("เกมจบ", utils_1.width / 2 - 150, utils_1.height / 2 - 150);
        return;
    }
}
module.exports = {
    runGameFrame,
    setCanvasCtx,
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGameFrame = runGameFrame;
exports.setCanvasCtx = setCanvasCtx;
const drawing_utils_1 = require("@mediapipe/drawing_utils");
const pose_1 = require("@mediapipe/pose");
const utils_1 = require("../../pages/game/utils");
var ElectronStore = require("electron-store");
var { ipcRenderer } = require("electron");
var store = new ElectronStore();
// import * as Pose1 from "../../pages/game/poses/pose1";
// import * as Pose2 from "../../pages/game/poses/pose2";
// import * as Pose3 from "../../pages/game/poses/pose3";
// import * as Pose4 from "../../pages/game/poses/pose4";
var Pose1;
var Pose2;
var Pose3;
var Pose4;
var Pose5;
var Pose6;
var posesInit = () => {
    Pose1 = require("../../pages/game/poses/pose1");
    Pose2 = require("../../pages/game/poses/pose2");
    Pose3 = require("../../pages/game/poses/pose3");
    Pose4 = require("../../pages/game/poses/pose4");
    Pose5 = require("../../pages/game/poses/pose5");
    Pose6 = require("../../pages/game/poses/pose6");
};
posesInit();
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
let pose5 = {
    starsArray: [Pose5.poseRStars, Pose5.poseLStars],
    setCoordinates: Pose5.setposeCoordinates,
    setCanvasCtx: Pose5.setposeCanvasCtx,
};
let pose6 = {
    starsArray: [Pose6.poseRStars, Pose6.poseLStars],
    setCoordinates: Pose6.setposeCoordinates,
    setCanvasCtx: Pose6.setposeCanvasCtx,
};
let poses = [pose1, pose2, pose3, pose4, pose5, pose6];
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
function setScores(scores) {
    ipcRenderer.send("set-scores", scores);
}
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
    poseNum = 11;
    for (let i = 0; i < poseStars.length; i++) {
        if (poseStars[i].every((star) => star.permanentlyActive || !star.hasPermanentlyActiveTimer)) {
            poseNum += 1;
        }
        else {
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
    if (timeLeft <= 0 || poseNum > poseNames.length - 1) {
        // canvasCtx.clearRect(0, 0, width, height);
        // canvasCtx.font = "150px Arial";
        // canvasCtx.textAlign = "center";
        // canvasCtx.textBaseline = "top";
        // canvasCtx.fillStyle = "red";
        // canvasCtx.fillText("เกมจบ", width / 2 - 150, height / 2 - 150);
        if (poseNum > 0) {
            for (let i = 0; i < poseNum - 1; i++) {
                scores[i] = 3;
            }
            scores[poseNum - 1] = 2;
            setScores(scores);
            previousPoseNum = poseNum;
        }
        posesInit();
        var { loadPage } = require("../../pages/main_page/main");
        setTimeout(() => {
            loadPage("statistics");
        }, 100);
        return;
    }
    drawPoseName(poseNum);
    poseStars[poseNum].forEach((star) => {
        star.runAll();
    });
}
module.exports = {
    runGameFrame,
    setCanvasCtx,
};

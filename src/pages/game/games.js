var { drawConnectors, drawLandmarks } = require("@mediapipe/drawing_utils");
var { POSE_CONNECTIONS, POSE_LANDMARKS } = require("@mediapipe/pose");

var { width, height } = require("../../pages/game/utils");
var { setpose1Coordinates, setpose1CanvasCtx, pose1stars } = require("../../pages/game/poses/pose1");
var { setpose2Coordinates, setpose2CanvasCtx, pose2stars } = require("../../pages/game/poses/pose2");
var { setpose3Coordinates, setpose3CanvasCtx, pose3stars } = require("../../pages/game/poses/pose3");
var { setpose4Coordinates, setpose4CanvasCtx, pose4Lstars, pose4Rstars } = require("../../pages/game/poses/pose4");

let setPosePoseCoordinates = [setpose1Coordinates, setpose2Coordinates, setpose3Coordinates, setpose4Coordinates];
let setPoseCanvasCtxs = [setpose1CanvasCtx, setpose2CanvasCtx, setpose3CanvasCtx, setpose4CanvasCtx];

let canvasCtx;
let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [0, 0];
}

function setCanvasCtx(ctx) {
    canvasCtx = ctx;
    setPoseCanvasCtxs.forEach(setPoseCanvasCtx => {
        setPoseCanvasCtx(ctx);
    })
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

function runGameFrame(results) {
    if (startTime == -1000) {
        startTime = Date.now();
    }

    timeLeft = parseInt(timeLimit - (Date.now() - startTime) / 1000);

    timeStr = formatTime(timeLeft);

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (!results.poseLandmarks) {
        return;
    }

    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, { color: "#FF0000", lineWidth: 2 });

    poseCoordinates = [];
    results.poseLandmarks.forEach((landmark) => {
        poseCoordinates.push([landmark.x * width, landmark.y * height]);
    });

    setPosePoseCoordinates.forEach(setPosePoseCoordinate => {
        setPosePoseCoordinate(poseCoordinates);
    })

    canvasCtx.font = "50px Arial";
    canvasCtx.textAlign = "end";
    canvasCtx.textBaseLine = "top";
    canvasCtx.fillStyle = "red";
    canvasCtx.fillText(timeStr, width - 20, 50);

    if (!pose1stars[2].permanentlyActive) {
        canvasCtx.font = "50px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.textBaseLine = "top";
        canvasCtx.fillStyle = "black";
        canvasCtx.fillText("ท่าที่ 1", width / 2 - 50, 50);
        pose1stars.forEach((star) => {
            star.runAll();
        });
    } else {
        if (!pose4Rstars[0].permanentlyActive) {
            canvasCtx.font = "50px Arial";
            canvasCtx.textAlign = "center";
            canvasCtx.textBaseLine = "top";
            canvasCtx.fillStyle = "black";
            canvasCtx.fillText("ท่าที่ 2 - ด้านขวา", width / 2 - 50, 50);
            pose4Rstars.forEach((star) => {
                star.runAll();
            });
        } else {
            canvasCtx.font = "50px Arial";
            canvasCtx.textAlign = "center";
            canvasCtx.textBaseLine = "top";
            canvasCtx.fillStyle = "black";
            canvasCtx.fillText("ท่าที่ 2 - ด้านซ้าย", width / 2 - 50, 50);
            pose4Lstars.forEach((star) => {
                star.runAll();
            });
        }
    }
}

module.exports = {
    runGameFrame,
    setCanvasCtx,
};
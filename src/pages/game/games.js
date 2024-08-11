var { drawConnectors, drawLandmarks } = require("@mediapipe/drawing_utils");
var { POSE_CONNECTIONS, POSE_LANDMARKS } = require("@mediapipe/pose");

var { width, height } = require("../../pages/game/utils");
var { setpose1Coordinates, setpose1CanvasCtx, pose1stars } = require("../../pages/game/poses/pose1");
var { setpose2Coordinates, setpose2CanvasCtx, pose2stars } = require("../../pages/game/poses/pose2");
var { setpose3Coordinates, setpose3CanvasCtx, pose3stars } = require("../../pages/game/poses/pose3");
var { setpose4Coordinates, setpose4CanvasCtx, pose4stars } = require("../../pages/game/poses/pose4");

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

function runGameFrame(results) {
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

    pose4stars.forEach(star => {
        star.runAll();
    });
}

module.exports = {
    runGameFrame,
    setCanvasCtx,
};
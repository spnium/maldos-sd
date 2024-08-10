var { drawConnectors, drawLandmarks } = require("@mediapipe/drawing_utils");
var { POSE_CONNECTIONS, POSE_LANDMARKS } = require("@mediapipe/pose");

var { setpose1Coordinates, setpose1CanvasCtx, pose1stars } = require("../../pages/game/pose1");

setPosePoseCoordinates = [setpose1Coordinates];
setPoseCanvasCtxs = [setpose1CanvasCtx];

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

    pose1stars.forEach(star => {
        star.runAll();
    });
}

module.exports = {
    runGameFrame,
    setCanvasCtx,
    Star,
    poseLMS,
    calculate_angle,
    coordinatesTouching,
    width,
    height,
};
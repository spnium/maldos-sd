"use strict";
var path = require("path");
var { Camera } = require("@mediapipe/camera_utils");
var { drawConnectors, drawLandmarks } = require("@mediapipe/drawing_utils");
var { Pose, POSE_CONNECTIONS, POSE_LANDMARKS } = require("@mediapipe/pose");
var { ipcRenderer } = require("electron");
const poseLMS = {
    NOSE: POSE_LANDMARKS.NOSE,
    RIGHT_EYE_INNER: POSE_LANDMARKS.LEFT_EYE_INNER,
    RIGHT_EYE: POSE_LANDMARKS.LEFT_EYE,
    RIGHT_EYE_OUTER: POSE_LANDMARKS.LEFT_EYE_OUTER,
    LEFT_EYE_INNER: POSE_LANDMARKS.RIGHT_EYE_INNER,
    LEFT_EYE: POSE_LANDMARKS.RIGHT_EYE,
    LEFT_EYE_OUTER: POSE_LANDMARKS.RIGHT_EYE_OUTER,
    RIGHT_EAR: POSE_LANDMARKS.LEFT_EAR,
    LEFT_EAR: POSE_LANDMARKS.RIGHT_EAR,
    MOUTH_RIGHT: POSE_LANDMARKS.MOUTH_LEFT,
    MOUTH_LEFT: POSE_LANDMARKS.MOUTH_RIGHT,
    RIGHT_SHOULDER: POSE_LANDMARKS.LEFT_SHOULDER,
    LEFT_SHOULDER: POSE_LANDMARKS.RIGHT_SHOULDER,
    RIGHT_ELBOW: POSE_LANDMARKS.LEFT_ELBOW,
    LEFT_ELBOW: POSE_LANDMARKS.RIGHT_ELBOW,
    RIGHT_WRIST: POSE_LANDMARKS.LEFT_WRIST,
    LEFT_WRIST: POSE_LANDMARKS.RIGHT_WRIST,
    RIGHT_PINKY: POSE_LANDMARKS.LEFT_PINKY,
    LEFT_PINKY: POSE_LANDMARKS.RIGHT_PINKY,
    RIGHT_INDEX: POSE_LANDMARKS.LEFT_INDEX,
    LEFT_INDEX: POSE_LANDMARKS.RIGHT_INDEX,
    RIGHT_THUMB: POSE_LANDMARKS.LEFT_THUMB,
    LEFT_THUMB: POSE_LANDMARKS.RIGHT_HIP,
    RIGHT_HIP: POSE_LANDMARKS.LEFT_HIP,
    LEFT_HIP: POSE_LANDMARKS.RIGHT_HIP,
};
const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const width = 1020;
const height = 680;
function calculate_angle(A, B, C) {
    var AB = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2));
    var BC = Math.sqrt(Math.pow(B[0] - C[0], 2) + Math.pow(B[1] - C[1], 2));
    var AC = Math.sqrt(Math.pow(C[0] - A[0], 2) + Math.pow(C[1] - A[1], 2));
    return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / Math.PI);
}
function coordinatesTouching(coordinates, [x, y], error = [50, 50]) {
    return (coordinates[0] > x - error[0] &&
        coordinates[0] < x + error[0] &&
        coordinates[1] > y - error[1] &&
        coordinates[1] < y + error[1]);
}
function drawStar(cx, cy, outerRadius, fill = true, color = "yellow", thickness = 1, offset = [0, 0]) {
    let ctx = canvasCtx;
    let rot = (Math.PI / 2) * 3;
    let [x, y] = [cx + offset[0], cy + offset[1]];
    let spikes = 5;
    let step = Math.PI / spikes;
    let innerRadius = outerRadius / 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    if (fill) {
        ctx.fillStyle = color;
        ctx.fill();
    }
    else {
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.stroke();
    }
}
class Star {
    constructor(name, x, y, functionToCheckActive = () => false, functionToCheckCoordinates = () => [x, y], active = false, color = "yellow") {
        this.name = name;
        this.x = x;
        this.y = y;
        this.functionToCheckActive = functionToCheckActive;
        this.functionToCheckCoordinates = functionToCheckCoordinates;
        this.active = active;
        this.color = color;
        this.x = x;
        this.y = y;
        this.active = active;
        this.color = color;
    }
    draw([x, y] = [this.x, this.y]) {
        if (x !== this.x || y !== this.y) {
            this.x = x;
            this.y = y;
        }
        drawStar(x, y, 30, this.active, this.color, 5);
    }
    isTouchingCoordinates(coordinates, error = [50, 50]) {
        return (coordinates[0] > this.x - error[0] &&
            coordinates[0] < this.x + error[0] &&
            coordinates[1] > this.y - error[1] &&
            coordinates[1] < this.y + error[1]);
    }
    isTouchingPoseLandmark(landmarkId, error = [50, 50]) {
        return this.isTouchingCoordinates(poseCoordinates[landmarkId], error);
    }
    runAll() {
        [this.x, this.y] = this.functionToCheckCoordinates();
        this.active = this.functionToCheckActive();
        this.draw();
    }
}
let poseCoordinates = [];
let defaultPoseCoordinate = [-1000, -1000];
let wristsMiddlePoint = defaultPoseCoordinate;
let right_wrist = defaultPoseCoordinate;
let left_wrist = defaultPoseCoordinate;
let left_arm_angle = -1000;
let right_arm_angle = -1000;
let left_elbow = defaultPoseCoordinate;
let right_elbow = defaultPoseCoordinate;
let left_shoulder = defaultPoseCoordinate;
let right_shoulder = defaultPoseCoordinate;
let topStar = new Star("topStar", width / 2, 120, () => {
    return topStar.isTouchingCoordinates(wristsMiddlePoint);
});
let sidStarCoordinates = [220, 240];
let leftStar = new Star("leftStar", sidStarCoordinates[0], sidStarCoordinates[1], () => {
    return leftStar.isTouchingCoordinates(wristsMiddlePoint);
});
let rightStar = new Star("rightStar", width - sidStarCoordinates[0], sidStarCoordinates[1], () => {
    return rightStar.isTouchingCoordinates(wristsMiddlePoint);
});
let angleMin = 150;
let angleMax = 200;
let leftElbowStar = new Star("leftElbowStar", left_elbow[0], left_elbow[1], () => {
    return left_arm_angle > angleMin && left_arm_angle < angleMax;
}, () => {
    return left_elbow;
});
let rightElbowStar = new Star("rightElbowStar", right_elbow[0], right_elbow[1], () => {
    return right_arm_angle > angleMin && right_arm_angle < angleMax;
}, () => {
    return right_elbow;
});
let wristsMiddleStar = new Star("wristsMiddleStar", wristsMiddlePoint[0], wristsMiddlePoint[1], () => {
    return coordinatesTouching(left_wrist, right_wrist, [300, 200]);
}, () => {
    return wristsMiddlePoint;
});
let stars = [topStar, leftStar, rightStar, leftElbowStar, rightElbowStar, wristsMiddleStar];
function onResults(results) {
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
    left_wrist = poseCoordinates[poseLMS.LEFT_WRIST];
    right_wrist = poseCoordinates[poseLMS.RIGHT_WRIST];
    left_elbow = poseCoordinates[poseLMS.LEFT_ELBOW];
    right_elbow = poseCoordinates[poseLMS.RIGHT_ELBOW];
    left_shoulder = poseCoordinates[poseLMS.LEFT_SHOULDER];
    right_shoulder = poseCoordinates[poseLMS.RIGHT_SHOULDER];
    left_arm_angle = calculate_angle(left_shoulder, left_elbow, left_wrist);
    right_arm_angle = calculate_angle(right_shoulder, right_elbow, right_wrist);
    wristsMiddlePoint = [
        (left_wrist[0] + right_wrist[0]) / 2,
        (left_wrist[1] + right_wrist[1]) / 2,
    ];
    stars.forEach((star) => {
        star.runAll();
    });
}
const pose = new Pose({
    locateFile: (file) => {
        return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
    },
});
pose.setOptions({
    selfieMode: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    enableSegmentation: false,
    minDetectionConfidence: 0.35,
    minTrackingConfidence: 0.35,
});
pose.onResults(onResults);
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await pose.send({ image: videoElement });
    },
    width: width,
    height: height,
});
ipcRenderer.on("start-web-game", () => {
    var _a;
    camera.start();
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
});
ipcRenderer.on("stop-web-game", () => {
    var _a;
    camera.stop();
    (_a = document.getElementById("listgamehidden")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
});
// function startGameFromGamePage() {
// 	// loadPage("home");
// 	ipcRenderer.send("start-game", true);
// 	// camera.stop();
// 	// camera.start();
// 	// startGame();
// 	document.getElementById("w-start-container")!.classList.add("hidden");
// }

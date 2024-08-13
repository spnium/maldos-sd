"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.height = exports.width = exports.poseLMS = exports.Star = void 0;
exports.setCanvasCtx = setCanvasCtx;
exports.calculate_angle = calculate_angle;
exports.coordinatesTouching = coordinatesTouching;
const pose_1 = require("@mediapipe/pose");
let canvasCtx;
let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [0, 0];
}
const poseLMS = {
    NOSE: pose_1.POSE_LANDMARKS.NOSE,
    RIGHT_EYE_INNER: pose_1.POSE_LANDMARKS.LEFT_EYE_INNER,
    RIGHT_EYE: pose_1.POSE_LANDMARKS.LEFT_EYE,
    RIGHT_EYE_OUTER: pose_1.POSE_LANDMARKS.LEFT_EYE_OUTER,
    LEFT_EYE_INNER: pose_1.POSE_LANDMARKS.RIGHT_EYE_INNER,
    LEFT_EYE: pose_1.POSE_LANDMARKS.RIGHT_EYE,
    LEFT_EYE_OUTER: pose_1.POSE_LANDMARKS.RIGHT_EYE_OUTER,
    RIGHT_EAR: pose_1.POSE_LANDMARKS.LEFT_EAR,
    LEFT_EAR: pose_1.POSE_LANDMARKS.RIGHT_EAR,
    MOUTH_RIGHT: pose_1.POSE_LANDMARKS.MOUTH_LEFT,
    MOUTH_LEFT: pose_1.POSE_LANDMARKS.MOUTH_RIGHT,
    RIGHT_SHOULDER: pose_1.POSE_LANDMARKS.LEFT_SHOULDER,
    LEFT_SHOULDER: pose_1.POSE_LANDMARKS.RIGHT_SHOULDER,
    RIGHT_ELBOW: pose_1.POSE_LANDMARKS.LEFT_ELBOW,
    LEFT_ELBOW: pose_1.POSE_LANDMARKS.RIGHT_ELBOW,
    RIGHT_WRIST: pose_1.POSE_LANDMARKS.LEFT_WRIST,
    LEFT_WRIST: pose_1.POSE_LANDMARKS.RIGHT_WRIST,
    RIGHT_PINKY: pose_1.POSE_LANDMARKS.LEFT_PINKY,
    LEFT_PINKY: pose_1.POSE_LANDMARKS.RIGHT_PINKY,
    RIGHT_INDEX: pose_1.POSE_LANDMARKS.LEFT_INDEX,
    LEFT_INDEX: pose_1.POSE_LANDMARKS.RIGHT_INDEX,
    RIGHT_THUMB: pose_1.POSE_LANDMARKS.LEFT_THUMB,
    LEFT_THUMB: pose_1.POSE_LANDMARKS.RIGHT_HIP,
    RIGHT_HIP: pose_1.POSE_LANDMARKS.LEFT_HIP,
    LEFT_HIP: pose_1.POSE_LANDMARKS.RIGHT_HIP,
};
exports.poseLMS = poseLMS;
const width = 1080;
exports.width = width;
const height = 720;
exports.height = height;
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
    constructor(x, y, functionToCheckActive = () => false, functionToCheckCoordinates = () => [x, y], hasPermanentlyActiveTimer = false, active = false, color = "yellow", permanentlyActive = false, timeToTriggerPermanentlyActive = 1 //10
    ) {
        this.activeTime = 0;
        this.startActiveTime = NaN;
        this.previouslyActive = false;
        this.permanentlyActive = false;
        this.hasPermanentlyActiveTimer = false;
        this.timeToTriggerPermanentlyActive = 1;
        this.x = x;
        this.y = y;
        this.active = active;
        this.color = color;
        this.functionToCheckActive = functionToCheckActive;
        this.functionToCheckCoordinates = functionToCheckCoordinates;
        this.hasPermanentlyActiveTimer = hasPermanentlyActiveTimer;
        this.permanentlyActive = permanentlyActive;
        this.timeToTriggerPermanentlyActive = timeToTriggerPermanentlyActive;
    }
    draw([x, y] = [this.x, this.y]) {
        if (x !== this.x || y !== this.y) {
            this.x = x;
            this.y = y;
        }
        drawStar(x, y, 30, this.permanentlyActive || this.active, this.color, 5);
    }
    isTouchingCoordinates(coordinates, error = [50, 50]) {
        return (coordinates[0] > this.x - error[0] &&
            coordinates[0] < this.x + error[0] &&
            coordinates[1] > this.y - error[1] &&
            coordinates[1] < this.y + error[1]);
    }
    runAll() {
        [this.x, this.y] = this.functionToCheckCoordinates();
        this.active = this.functionToCheckActive();
        if (this.hasPermanentlyActiveTimer) {
            this.runPermanentlyActiveTimer();
            if (this.active) {
                this.drawTimer(this.activeTime);
            }
        }
        this.draw();
    }
    runPermanentlyActiveTimer() {
        if (this.active) {
            this.activeTime = Date.now() / 1000 - this.startActiveTime;
        }
        if (this.active && !this.previouslyActive) {
            this.startActiveTime = Date.now() / 1000;
            this.previouslyActive = true;
        }
        if (!this.active) {
            this.previouslyActive = false;
            this.activeTime = 0;
        }
        if (this.previouslyActive &&
            Date.now() / 1000 - this.startActiveTime > this.timeToTriggerPermanentlyActive) {
            this.permanentlyActive = true;
        }
    }
    drawTimer(time) {
        if (!this.permanentlyActive) {
            let timerWidth = 260;
            let timerHeight = 40;
            let timerX = 0;
            let timerY = 0;
            canvasCtx.fillStyle = "black";
            canvasCtx.fillRect(timerX, timerY, timerWidth, timerHeight);
            let timerProgress = time / this.timeToTriggerPermanentlyActive;
            canvasCtx.fillStyle = "green";
            canvasCtx.fillRect(timerX, timerY, timerProgress * timerWidth, timerHeight);
        }
    }
}
exports.Star = Star;
function setCanvasCtx(ctx) {
    canvasCtx = ctx;
}
module.exports = {
    setCanvasCtx,
    Star,
    poseLMS,
    calculate_angle,
    coordinatesTouching,
    width,
    height,
};

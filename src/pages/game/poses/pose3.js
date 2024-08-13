"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var { setCanvasCtx, Star, poseLMS, calculate_angle, coordinatesTouching, width, height, } = require("../utils.js");
let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [-1000, -1000];
}
function setposeCoordinates(coordinates) {
    poseCoordinates = coordinates;
}
function setposeCanvasCtx(ctx) {
    setCanvasCtx(ctx);
}
let poseRStars = [];
let poseLStars = [];
module.exports = {
    setposeCoordinates,
    setposeCanvasCtx,
    poseRStars,
    poseLStars,
};

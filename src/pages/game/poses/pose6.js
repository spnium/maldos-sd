"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poseLStars = exports.poseRStars = void 0;
exports.setposeCoordinates = setposeCoordinates;
exports.setposeCanvasCtx = setposeCanvasCtx;
const utils_1 = require("../utils");
let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [-1000, -1000];
}
function setposeCoordinates(coordinates) {
    poseCoordinates = coordinates;
}
function setposeCanvasCtx(ctx) {
    (0, utils_1.setCanvasCtx)(ctx);
}
function shoulders_midpoint() {
    return [
        (poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][0] + poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][0]) / 2,
        (poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][1] + poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][1]) / 2,
    ];
}
function eyes_midpoint() {
    return [
        (poseCoordinates[utils_1.poseLMS.LEFT_EYE_OUTER][0] + poseCoordinates[utils_1.poseLMS.RIGHT_EYE_OUTER][0]) /
            2,
        (poseCoordinates[utils_1.poseLMS.LEFT_EYE_OUTER][1] + poseCoordinates[utils_1.poseLMS.RIGHT_EYE_OUTER][1]) /
            2,
    ];
}
function eyes_to_shoulder_angle() {
    return (0, utils_1.calculate_angle)(eyes_midpoint(), shoulders_midpoint(), [
        eyes_midpoint()[0],
        eyes_midpoint()[1] + 800,
    ]);
}
function left_arm_angle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.LEFT_WRIST], poseCoordinates[utils_1.poseLMS.LEFT_ELBOW], poseCoordinates[utils_1.poseLMS.LEFT_SHOULDER]);
}
function right_arm_angle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.RIGHT_WRIST], poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW], poseCoordinates[utils_1.poseLMS.RIGHT_SHOULDER]);
}
let lHandStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_INDEX][0], poseCoordinates[utils_1.poseLMS.LEFT_INDEX][1], () => {
    return ((0, utils_1.coordinatesTouching)(poseCoordinates[utils_1.poseLMS.LEFT_INDEX], eyes_midpoint(), [200, 200]) &&
        eyes_to_shoulder_angle() < 160);
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_INDEX];
}, true);
let rHandStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_INDEX][0], poseCoordinates[utils_1.poseLMS.RIGHT_INDEX][1], () => {
    return ((0, utils_1.coordinatesTouching)(poseCoordinates[utils_1.poseLMS.RIGHT_INDEX], eyes_midpoint(), [200, 200]) && eyes_to_shoulder_angle() < 160);
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_INDEX];
}, true);
let poseRStars = [rHandStar];
exports.poseRStars = poseRStars;
let poseLStars = [lHandStar];
exports.poseLStars = poseLStars;
module.exports = {
    setposeCoordinates,
    setposeCanvasCtx,
    poseRStars,
    poseLStars,
};

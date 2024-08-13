"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poseRstars = exports.poseLstars = void 0;
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
function wristMiddlePoint() {
    return [
        (poseCoordinates[utils_1.poseLMS.RIGHT_WRIST][0] + poseCoordinates[utils_1.poseLMS.LEFT_WRIST][0]) / 2,
        (poseCoordinates[utils_1.poseLMS.RIGHT_WRIST][1] + poseCoordinates[utils_1.poseLMS.LEFT_WRIST][1]) / 2,
    ];
}
function left_arm_angle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.LEFT_WRIST], poseCoordinates[utils_1.poseLMS.LEFT_ELBOW], poseCoordinates[utils_1.poseLMS.LEFT_SHOULDER]);
}
function right_arm_angle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.RIGHT_WRIST], poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW], poseCoordinates[utils_1.poseLMS.RIGHT_SHOULDER]);
}
let lLeftElbowStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][0], poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][1], () => {
    return left_arm_angle() < 120 && left_arm_angle() > 60;
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_ELBOW];
});
let rRightElbowStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][0], poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][1], () => {
    return right_arm_angle() < 120 && right_arm_angle() > 60;
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW];
});
let rLeftElbowStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][0], poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][1], () => {
    return rRightHandStar.active;
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_ELBOW];
});
let lRightElbowStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][0], poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][1], () => {
    return lLeftHandStar.active;
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW];
});
let lLeftHandStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_PINKY][0], poseCoordinates[utils_1.poseLMS.LEFT_PINKY][1], () => {
    return (0, utils_1.coordinatesTouching)(poseCoordinates[utils_1.poseLMS.LEFT_PINKY], poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW], [100, 100]);
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_PINKY];
}, true);
let rRightHandStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_INDEX][0], poseCoordinates[utils_1.poseLMS.RIGHT_INDEX][1], () => {
    return (0, utils_1.coordinatesTouching)(poseCoordinates[utils_1.poseLMS.RIGHT_PINKY], poseCoordinates[utils_1.poseLMS.LEFT_ELBOW], [100, 100]);
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_PINKY];
}, true);
let poseLstars = [lLeftHandStar, lLeftElbowStar, lRightElbowStar];
exports.poseLstars = poseLstars;
let poseRstars = [rRightHandStar, rRightElbowStar, rLeftElbowStar];
exports.poseRstars = poseRstars;
module.exports = {
    setposeCoordinates,
    setposeCanvasCtx,
    poseLstars,
    poseRstars,
};

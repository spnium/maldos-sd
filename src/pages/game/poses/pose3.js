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
function leftKneeAngle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.LEFT_HIP], poseCoordinates[utils_1.poseLMS.LEFT_KNEE], poseCoordinates[utils_1.poseLMS.LEFT_ANKLE]);
}
function rightKneeAngle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.RIGHT_HIP], poseCoordinates[utils_1.poseLMS.RIGHT_KNEE], poseCoordinates[utils_1.poseLMS.RIGHT_ANKLE]);
}
function leftHipAngle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.LEFT_SHOULDER], poseCoordinates[utils_1.poseLMS.LEFT_HIP], poseCoordinates[utils_1.poseLMS.LEFT_KNEE]);
}
function rightHipAngle() {
    return (0, utils_1.calculate_angle)(poseCoordinates[utils_1.poseLMS.RIGHT_SHOULDER], poseCoordinates[utils_1.poseLMS.RIGHT_HIP], poseCoordinates[utils_1.poseLMS.RIGHT_KNEE]);
}
let rRightKneeStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_KNEE][0], poseCoordinates[utils_1.poseLMS.RIGHT_KNEE][1], () => {
    return rightKneeAngle() > 70 && rightKneeAngle() < 110;
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_KNEE];
}, true);
let lLeftKneeStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_KNEE][0], poseCoordinates[utils_1.poseLMS.LEFT_KNEE][1], () => {
    return leftKneeAngle() > 70 && leftKneeAngle() < 110;
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_KNEE];
}, true);
let rRightHipStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_HIP][0], poseCoordinates[utils_1.poseLMS.RIGHT_HIP][1], () => {
    return rRightKneeStar.active;
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_HIP];
}, true);
let lLeftHipStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_HIP][0], poseCoordinates[utils_1.poseLMS.LEFT_HIP][1], () => {
    return lLeftKneeStar.active;
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_HIP];
}, true);
let poseRStars = [rRightKneeStar, rRightHipStar];
exports.poseRStars = poseRStars;
let poseLStars = [lLeftKneeStar, lLeftHipStar];
exports.poseLStars = poseLStars;
module.exports = {
    setposeCoordinates,
    setposeCanvasCtx,
    poseRStars,
    poseLStars,
};

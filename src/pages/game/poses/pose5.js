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
let rrRightKneeStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_KNEE][0], poseCoordinates[utils_1.poseLMS.RIGHT_KNEE][1], () => {
    return rightKneeAngle() < 45;
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_KNEE];
}, true);
let llLeftKneeStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_KNEE][0], poseCoordinates[utils_1.poseLMS.LEFT_KNEE][1], () => {
    return leftKneeAngle() < 45;
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_KNEE];
}, true);
let poseRStars = [rrRightKneeStar];
exports.poseRStars = poseRStars;
let poseLStars = [llLeftKneeStar];
exports.poseLStars = poseLStars;
module.exports = {
    setposeCoordinates,
    setposeCanvasCtx,
    poseRStars,
    poseLStars,
};

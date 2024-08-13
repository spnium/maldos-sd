"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.poseStars = void 0;
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
let topStar = new utils_1.Star(utils_1.width / 2, 120, () => {
    return topStar.isTouchingCoordinates(wristMiddlePoint());
}, undefined, true);
let sideStarCoordinates = [220, 240];
let pose1LeftStar = new utils_1.Star(sideStarCoordinates[0], sideStarCoordinates[1], () => {
    return pose1LeftStar.isTouchingCoordinates(wristMiddlePoint());
}, undefined, true);
let pose1RightStar = new utils_1.Star(utils_1.width - sideStarCoordinates[0], sideStarCoordinates[1], () => {
    return pose1RightStar.isTouchingCoordinates(wristMiddlePoint());
}, undefined, true);
let angleMin = 150;
let angleMax = 200;
let pose1LeftElbowStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][0], poseCoordinates[utils_1.poseLMS.LEFT_ELBOW][1], () => {
    return left_arm_angle() > angleMin && left_arm_angle() < angleMax;
}, () => {
    return poseCoordinates[utils_1.poseLMS.LEFT_ELBOW];
});
let pose1RightElbowStar = new utils_1.Star(poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][0], poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW][1], () => {
    return right_arm_angle() > angleMin && right_arm_angle() < angleMax;
}, () => {
    return poseCoordinates[utils_1.poseLMS.RIGHT_ELBOW];
});
let wristsMiddleStar = new utils_1.Star(wristMiddlePoint()[0], wristMiddlePoint()[1], () => {
    return (0, utils_1.coordinatesTouching)(poseCoordinates[utils_1.poseLMS.RIGHT_WRIST], poseCoordinates[utils_1.poseLMS.LEFT_WRIST], [300, 200]);
}, () => {
    return wristMiddlePoint();
});
let poseStars = [
    topStar,
    pose1LeftStar,
    pose1RightStar,
    pose1LeftElbowStar,
    pose1RightElbowStar,
    wristsMiddleStar,
];
exports.poseStars = poseStars;
module.exports = {
    setposeCoordinates,
    setposeCanvasCtx,
    poseStars,
};

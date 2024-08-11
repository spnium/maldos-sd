var { setCanvasCtx, Star, poseLMS, calculate_angle, coordinatesTouching, width, height } = require("../utils.js");

let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [-1000, -1000];
}

function setpose3Coordinates(coordinates) {
    poseCoordinates = coordinates;
}

function setpose3CanvasCtx(ctx) {
    setCanvasCtx(ctx);
}

function wristMiddlePoint() {
    return [
        (poseCoordinates[poseLMS.RIGHT_WRIST][0] + poseCoordinates[poseLMS.LEFT_WRIST][0]) / 2,
        (poseCoordinates[poseLMS.RIGHT_WRIST][1] + poseCoordinates[poseLMS.LEFT_WRIST][1]) / 2,
    ];
}

function left_arm_angle() {
    return calculate_angle(
        poseCoordinates[poseLMS.LEFT_WRIST],
        poseCoordinates[poseLMS.LEFT_ELBOW],
        poseCoordinates[poseLMS.LEFT_SHOULDER]
    );
}

function right_arm_angle() {
    return calculate_angle(
        poseCoordinates[poseLMS.RIGHT_WRIST],
        poseCoordinates[poseLMS.RIGHT_ELBOW],
        poseCoordinates[poseLMS.RIGHT_SHOULDER]
    );
}



let pose3stars = [

];

module.exports = {
    setpose3Coordinates,
    setpose3CanvasCtx,
    pose3stars
};
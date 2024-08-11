var { setCanvasCtx, Star, poseLMS, calculate_angle, coordinatesTouching, width, height } = require("../utils.js");

let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [-1000, -1000];
}

function setpose2Coordinates(coordinates) {
    poseCoordinates = coordinates;
}

function setpose2CanvasCtx(ctx) {
    setCanvasCtx(ctx);
}

module.exports = {
    setpose2Coordinates,
    setpose2CanvasCtx,
}
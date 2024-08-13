var {
	setCanvasCtx,
	Star,
	poseLMS,
	calculate_angle,
	coordinatesTouching,
	width,
	height,
} = require("../utils.js");

let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
	poseCoordinates[i] = [-1000, -1000];
}

function setposeCoordinates(coordinates: number[]) {
	poseCoordinates = coordinates;
}

function setposeCanvasCtx(ctx: CanvasRenderingContext2D) {
	setCanvasCtx(ctx);
}

let poseRStars: (typeof Star)[] = [];
let poseLStars: (typeof Star)[] = [];

module.exports = {
	setposeCoordinates,
	setposeCanvasCtx,
	poseRStars,
	poseLStars,
};

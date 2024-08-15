import {
	setCanvasCtx,
	Star,
	poseLMS,
	calculate_angle,
	coordinatesTouching,
	width,
	height,
} from "../utils";

let poseCoordinates: number[][] = [];
for (let i = 0; i < 33; i++) {
	poseCoordinates[i] = [-1000, -1000];
}

function setposeCoordinates(coordinates: number[][]) {
	poseCoordinates = coordinates;
}

function setposeCanvasCtx(ctx: CanvasRenderingContext2D) {
	setCanvasCtx(ctx);
}

function shoulders_midpoint() {
	return [
		(poseCoordinates[poseLMS.LEFT_ELBOW][0] + poseCoordinates[poseLMS.RIGHT_ELBOW][0]) / 2,
		(poseCoordinates[poseLMS.LEFT_ELBOW][1] + poseCoordinates[poseLMS.RIGHT_ELBOW][1]) / 2,
	];
}

function eyes_midpoint() {
	return [
		(poseCoordinates[poseLMS.LEFT_EYE_OUTER][0] + poseCoordinates[poseLMS.RIGHT_EYE_OUTER][0]) /
			2,
		(poseCoordinates[poseLMS.LEFT_EYE_OUTER][1] + poseCoordinates[poseLMS.RIGHT_EYE_OUTER][1]) /
			2,
	];
}

// let top_of_head = () => {
// 	// let r = eyes_midpoint()[0];
// 	// return [eyes_midpoint()[0], eyes_midpoint()[1] - 0.3 * r];

// };

function eyes_to_shoulder_angle() {
	return calculate_angle(eyes_midpoint(), shoulders_midpoint(), [
		eyes_midpoint()[0],
		eyes_midpoint()[1] + 800,
	]);
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

let lHandStar = new Star(
	poseCoordinates[poseLMS.LEFT_INDEX][0],
	poseCoordinates[poseLMS.LEFT_INDEX][1],
	() => {
		return (
			coordinatesTouching(poseCoordinates[poseLMS.LEFT_INDEX], eyes_midpoint(), [200, 200]) &&
			eyes_to_shoulder_angle() < 160
		);
	},
	() => {
		return poseCoordinates[poseLMS.LEFT_INDEX];
	},
	true
);

let rHandStar = new Star(
	poseCoordinates[poseLMS.RIGHT_INDEX][0],
	poseCoordinates[poseLMS.RIGHT_INDEX][1],
	() => {
		return (
			coordinatesTouching(
				poseCoordinates[poseLMS.RIGHT_INDEX],
				eyes_midpoint(),
				[200, 200]
			) && eyes_to_shoulder_angle() < 160
		);
	},

	() => {
		return poseCoordinates[poseLMS.RIGHT_INDEX];
	},
	true
);
let poseRStars: Star[] = [rHandStar];
let poseLStars: Star[] = [lHandStar];

module.exports = {
	setposeCoordinates,
	setposeCanvasCtx,
	poseRStars,
	poseLStars,
};

export { setposeCoordinates, setposeCanvasCtx, poseRStars, poseLStars };

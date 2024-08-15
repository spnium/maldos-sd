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

function leftKneeAngle() {
	return calculate_angle(
		poseCoordinates[poseLMS.LEFT_HIP],
		poseCoordinates[poseLMS.LEFT_KNEE],
		poseCoordinates[poseLMS.LEFT_ANKLE]
	);
}

function rightKneeAngle() {
	return calculate_angle(
		poseCoordinates[poseLMS.RIGHT_HIP],
		poseCoordinates[poseLMS.RIGHT_KNEE],
		poseCoordinates[poseLMS.RIGHT_ANKLE]
	);
}

function leftHipAngle() {
	return calculate_angle(
		poseCoordinates[poseLMS.LEFT_SHOULDER],
		poseCoordinates[poseLMS.LEFT_HIP],
		poseCoordinates[poseLMS.LEFT_KNEE]
	);
}

function rightHipAngle() {
	return calculate_angle(
		poseCoordinates[poseLMS.RIGHT_SHOULDER],
		poseCoordinates[poseLMS.RIGHT_HIP],
		poseCoordinates[poseLMS.RIGHT_KNEE]
	);
}

let rRightKneeStar = new Star(
	poseCoordinates[poseLMS.RIGHT_KNEE][0],
	poseCoordinates[poseLMS.RIGHT_KNEE][1],
	() => {
		return rightKneeAngle() > 70 && rightKneeAngle() < 110;
	},
	() => {
		return poseCoordinates[poseLMS.RIGHT_KNEE];
	},
	true
);

let lLeftKneeStar = new Star(
	poseCoordinates[poseLMS.LEFT_KNEE][0],
	poseCoordinates[poseLMS.LEFT_KNEE][1],
	() => {
		return leftKneeAngle() > 70 && leftKneeAngle() < 110;
	},
	() => {
		return poseCoordinates[poseLMS.LEFT_KNEE];
	},
	true
);

let rRightHipStar = new Star(
	poseCoordinates[poseLMS.RIGHT_HIP][0],
	poseCoordinates[poseLMS.RIGHT_HIP][1],
	() => {
		return rRightKneeStar.active;
	},
	() => {
		return poseCoordinates[poseLMS.RIGHT_HIP];
	},
	true
);

let lLeftHipStar = new Star(
	poseCoordinates[poseLMS.LEFT_HIP][0],
	poseCoordinates[poseLMS.LEFT_HIP][1],
	() => {
		return lLeftKneeStar.active;
	},
	() => {
		return poseCoordinates[poseLMS.LEFT_HIP];
	},
	true
);

let poseRStars: Star[] = [rRightKneeStar, rRightHipStar];
let poseLStars: Star[] = [lLeftKneeStar, lLeftHipStar];

module.exports = {
	setposeCoordinates,
	setposeCanvasCtx,
	poseRStars,
	poseLStars,
};

export { setposeCoordinates, setposeCanvasCtx, poseRStars, poseLStars };

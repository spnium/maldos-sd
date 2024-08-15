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

let rightKneeStar = new Star(
	poseCoordinates[poseLMS.RIGHT_KNEE][0],
	poseCoordinates[poseLMS.RIGHT_KNEE][1],
	() => {
		return (
			rightKneeAngle() < 60 ||
			coordinatesTouching(
				poseCoordinates[poseLMS.RIGHT_ANKLE],
				poseCoordinates[poseLMS.RIGHT_KNEE],
				[100, 100]
			) ||
			coordinatesTouching(
				poseCoordinates[poseLMS.RIGHT_KNEE],
				poseCoordinates[poseLMS.RIGHT_INDEX],
				[80, 80]
			)
		);
	},
	() => {
		return poseCoordinates[poseLMS.RIGHT_KNEE];
	},
	true
);

let leftKneeStar = new Star(
	poseCoordinates[poseLMS.LEFT_KNEE][0],
	poseCoordinates[poseLMS.LEFT_KNEE][1],
	() => {
		return (
			leftKneeAngle() < 60 ||
			coordinatesTouching(
				poseCoordinates[poseLMS.LEFT_ANKLE],
				poseCoordinates[poseLMS.LEFT_KNEE],
				[100, 100]
			) ||
			coordinatesTouching(
				poseCoordinates[poseLMS.LEFT_KNEE],
				poseCoordinates[poseLMS.LEFT_INDEX],
				[80, 80]
			)
		);
	},
	() => {
		return poseCoordinates[poseLMS.LEFT_KNEE];
	},
	true
);

let poseRStars: Star[] = [rightKneeStar];
let poseLStars: Star[] = [leftKneeStar];

module.exports = {
	setposeCoordinates,
	setposeCanvasCtx,
	poseRStars,
	poseLStars,
};

export { setposeCoordinates, setposeCanvasCtx, poseRStars, poseLStars };

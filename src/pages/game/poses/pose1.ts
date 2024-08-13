var {
	setCanvasCtx,
	Star,
	poseLMS,
	calculate_angle,
	coordinatesTouching,
	width,
	height,
} = require("../utils.js");

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

let topStar = new Star(
	width / 2,
	120,
	() => {
		return topStar.isTouchingCoordinates(wristMiddlePoint());
	},
	undefined,
	true
);

let sideStarCoordinates = [220, 240];

let pose1LeftStar = new Star(
	sideStarCoordinates[0],
	sideStarCoordinates[1],
	() => {
		return pose1LeftStar.isTouchingCoordinates(wristMiddlePoint());
	},
	undefined,
	true
);

let pose1RightStar = new Star(
	width - sideStarCoordinates[0],
	sideStarCoordinates[1],
	() => {
		return pose1RightStar.isTouchingCoordinates(wristMiddlePoint());
	},
	undefined,
	true
);

let angleMin = 150;
let angleMax = 200;

let pose1LeftElbowStar = new Star(
	poseCoordinates[poseLMS.LEFT_ELBOW][0],
	poseCoordinates[poseLMS.LEFT_ELBOW][1],
	() => {
		return left_arm_angle() > angleMin && left_arm_angle() < angleMax;
	},
	() => {
		return poseCoordinates[poseLMS.LEFT_ELBOW];
	}
);

let pose1RightElbowStar = new Star(
	poseCoordinates[poseLMS.RIGHT_ELBOW][0],
	poseCoordinates[poseLMS.RIGHT_ELBOW][1],
	() => {
		return right_arm_angle() > angleMin && right_arm_angle() < angleMax;
	},
	() => {
		return poseCoordinates[poseLMS.RIGHT_ELBOW];
	}
);

let wristsMiddleStar = new Star(
	wristMiddlePoint()[0],
	wristMiddlePoint()[1],
	() => {
		return coordinatesTouching(
			poseCoordinates[poseLMS.RIGHT_WRIST],
			poseCoordinates[poseLMS.LEFT_WRIST],
			[300, 200]
		);
	},
	() => {
		return wristMiddlePoint();
	}
);

let poseStars = [
	topStar,
	pose1LeftStar,
	pose1RightStar,
	pose1LeftElbowStar,
	pose1RightElbowStar,
	wristsMiddleStar,
];

module.exports = {
	setposeCoordinates,
	setposeCanvasCtx,
	poseStars,
};

var path = require("path");
var { drawConnectors, drawLandmarks } = require("@mediapipe/drawing_utils");
var { Pose, POSE_CONNECTIONS, POSE_LANDMARKS } = require("@mediapipe/pose");
var { ipcRenderer } = require("electron");

const poseLMS = {
	NOSE: POSE_LANDMARKS.NOSE,
	RIGHT_EYE_INNER: POSE_LANDMARKS.LEFT_EYE_INNER,
	RIGHT_EYE: POSE_LANDMARKS.LEFT_EYE,
	RIGHT_EYE_OUTER: POSE_LANDMARKS.LEFT_EYE_OUTER,
	LEFT_EYE_INNER: POSE_LANDMARKS.RIGHT_EYE_INNER,
	LEFT_EYE: POSE_LANDMARKS.RIGHT_EYE,
	LEFT_EYE_OUTER: POSE_LANDMARKS.RIGHT_EYE_OUTER,
	RIGHT_EAR: POSE_LANDMARKS.LEFT_EAR,
	LEFT_EAR: POSE_LANDMARKS.RIGHT_EAR,
	MOUTH_RIGHT: POSE_LANDMARKS.MOUTH_LEFT,
	MOUTH_LEFT: POSE_LANDMARKS.MOUTH_RIGHT,
	RIGHT_SHOULDER: POSE_LANDMARKS.LEFT_SHOULDER,
	LEFT_SHOULDER: POSE_LANDMARKS.RIGHT_SHOULDER,
	RIGHT_ELBOW: POSE_LANDMARKS.LEFT_ELBOW,
	LEFT_ELBOW: POSE_LANDMARKS.RIGHT_ELBOW,
	RIGHT_WRIST: POSE_LANDMARKS.LEFT_WRIST,
	LEFT_WRIST: POSE_LANDMARKS.RIGHT_WRIST,
	RIGHT_PINKY: POSE_LANDMARKS.LEFT_PINKY,
	LEFT_PINKY: POSE_LANDMARKS.RIGHT_PINKY,
	RIGHT_INDEX: POSE_LANDMARKS.LEFT_INDEX,
	LEFT_INDEX: POSE_LANDMARKS.RIGHT_INDEX,
	RIGHT_THUMB: POSE_LANDMARKS.LEFT_THUMB,
	LEFT_THUMB: POSE_LANDMARKS.RIGHT_HIP,
	RIGHT_HIP: POSE_LANDMARKS.LEFT_HIP,
	LEFT_HIP: POSE_LANDMARKS.RIGHT_HIP,
};

const videoElement = document.getElementsByClassName("input_video")[0] as HTMLVideoElement;
const canvasElement = document.getElementsByClassName("output_canvas")[0] as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d") as CanvasRenderingContext2D;

const width = 1080;
const height = 720;

function calculate_angle(A: number[], B: number[], C: number[]) {
	var AB = Math.sqrt(Math.pow(B[0] - A[0], 2) + Math.pow(B[1] - A[1], 2));
	var BC = Math.sqrt(Math.pow(B[0] - C[0], 2) + Math.pow(B[1] - C[1], 2));
	var AC = Math.sqrt(Math.pow(C[0] - A[0], 2) + Math.pow(C[1] - A[1], 2));
	return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / Math.PI);
}

function coordinatesTouching(coordinates: number[], [x, y]: number[], error: number[] = [50, 50]) {
	return (
		coordinates[0] > x - error[0] &&
		coordinates[0] < x + error[0] &&
		coordinates[1] > y - error[1] &&
		coordinates[1] < y + error[1]
	);
}

function drawStar(
	cx: number,
	cy: number,
	outerRadius: number,
	fill: boolean = true,
	color: string = "yellow",
	thickness: number = 1,
	offset: number[] = [0, 0]
) {
	let ctx = canvasCtx;
	let rot = (Math.PI / 2) * 3;
	let [x, y] = [cx + offset[0], cy + offset[1]];
	let spikes = 5;
	let step = Math.PI / spikes;
	let innerRadius = outerRadius / 2.5;

	ctx.beginPath();
	ctx.moveTo(cx, cy - outerRadius);
	for (let i = 0; i < spikes; i++) {
		x = cx + Math.cos(rot) * outerRadius;
		y = cy + Math.sin(rot) * outerRadius;
		ctx.lineTo(x, y);
		rot += step;

		x = cx + Math.cos(rot) * innerRadius;
		y = cy + Math.sin(rot) * innerRadius;
		ctx.lineTo(x, y);
		rot += step;
	}
	ctx.lineTo(cx, cy - outerRadius);
	ctx.closePath();

	if (fill) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color;
		ctx.lineWidth = thickness;
		ctx.stroke();
	}
}

class Star {
	public activeTime: number = 0;
	public startActiveTime: number = NaN;
	public previouslyActive: boolean = false;
	constructor(
		public x: number,
		public y: number,
		public functionToCheckActive: () => boolean = () => false,
		public functionToCheckCoordinates: () => number[] = () => [x, y],
		public hasPermanentlyActiveTimer: boolean = false,
		public active: boolean = false,
		public color: string = "yellow",
		public permanentlyActive: boolean = false,
		public timeToTriggerPermanentlyActive: number = 10
	) {
		this.x = x;
		this.y = y;
		this.active = active;
		this.color = color;
	}

	draw([x, y]: number[] = [this.x, this.y]) {
		if (x !== this.x || y !== this.y) {
			this.x = x;
			this.y = y;
		}
		drawStar(x, y, 30, this.permanentlyActive || this.active, this.color, 5);
	}

	isTouchingCoordinates(coordinates: number[], error: number[] = [50, 50]) {
		return (
			coordinates[0] > this.x - error[0] &&
			coordinates[0] < this.x + error[0] &&
			coordinates[1] > this.y - error[1] &&
			coordinates[1] < this.y + error[1]
		);
	}

	runAll() {
		[this.x, this.y] = this.functionToCheckCoordinates();
		this.active = this.functionToCheckActive();
		if (this.hasPermanentlyActiveTimer) {
			this.runPermanentlyActiveTimer();
			if (this.active) {
				this.drawTimer(this.activeTime);
			}
		}
		this.draw();
	}

	runPermanentlyActiveTimer() {
		if (this.active) {
			this.activeTime = Date.now() / 1000 - this.startActiveTime;
		}
		if (this.active && !this.previouslyActive) {
			this.startActiveTime = Date.now() / 1000;
			this.previouslyActive = true;
		}
		if (!this.active) {
			this.previouslyActive = false;
			this.activeTime = 0;
		}
		if (
			this.previouslyActive &&
			Date.now() / 1000 - this.startActiveTime > this.timeToTriggerPermanentlyActive
		) {
			this.permanentlyActive = true;
		}
	}

	drawTimer(time: number) {
		if (!this.permanentlyActive) {
			let timerWidth = 400;
			let timerHeight = 40;
			let timerX = 0;
			let timerY = 0;
			canvasCtx.fillStyle = "black";
			canvasCtx.fillRect(timerX, timerY, timerWidth, timerHeight);

			let timerProgress = time / this.timeToTriggerPermanentlyActive;
			canvasCtx.fillStyle = "green";
			canvasCtx.fillRect(timerX, timerY, timerProgress * timerWidth, timerHeight);
		}
	}
}

let poseCoordinates: number[][] = [];
let defaultPoseCoordinate = [-1000, -1000];
let wristsMiddlePoint = defaultPoseCoordinate;
let right_wrist = defaultPoseCoordinate;
let left_wrist = defaultPoseCoordinate;
let left_arm_angle = -1000;
let right_arm_angle = -1000;
let left_elbow = defaultPoseCoordinate;
let right_elbow = defaultPoseCoordinate;
let left_shoulder = defaultPoseCoordinate;
let right_shoulder = defaultPoseCoordinate;

let topStar = new Star(
	width / 2,
	120,
	() => {
		return topStar.isTouchingCoordinates(wristsMiddlePoint);
	},
	undefined,
	true
) as Star;

let sidStarCoordinates = [220, 240];

let pose1LeftStar = new Star(
	sidStarCoordinates[0],
	sidStarCoordinates[1],
	() => {
		return pose1LeftStar.isTouchingCoordinates(wristsMiddlePoint);
	},
	undefined,
	true
) as Star;

let pose1RightStar = new Star(
	width - sidStarCoordinates[0],
	sidStarCoordinates[1],
	() => {
		return pose1RightStar.isTouchingCoordinates(wristsMiddlePoint);
	},
	undefined,
	true
) as Star;

let angleMin = 150;
let angleMax = 200;

let pose1LeftElbowStar = new Star(
	left_elbow[0],
	left_elbow[1],
	() => {
		return left_arm_angle > angleMin && left_arm_angle < angleMax;
	},
	() => {
		return left_elbow;
	}
) as Star;

let pose1RightElbowStar = new Star(
	right_elbow[0],
	right_elbow[1],
	() => {
		return right_arm_angle > angleMin && right_arm_angle < angleMax;
	},
	() => {
		return right_elbow;
	}
) as Star;

let wristsMiddleStar = new Star(
	wristsMiddlePoint[0],
	wristsMiddlePoint[1],
	() => {
		return coordinatesTouching(left_wrist, right_wrist, [300, 200]);
	},
	() => {
		return wristsMiddlePoint;
	}
) as Star;

let pose1stars = [
	topStar,
	pose1LeftStar,
	pose1RightStar,
	pose1LeftElbowStar,
	pose1RightElbowStar,
	wristsMiddleStar,
];

function onResults(results: any) {
	canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

	canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

	if (!results.poseLandmarks) {
		return;
	}

	drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
		color: "#00FF00",
		lineWidth: 4,
	});
	drawLandmarks(canvasCtx, results.poseLandmarks, { color: "#FF0000", lineWidth: 2 });

	poseCoordinates = [];
	results.poseLandmarks.forEach((landmark: any) => {
		poseCoordinates.push([landmark.x * width, landmark.y * height]);
	});

	left_wrist = poseCoordinates[poseLMS.LEFT_WRIST];
	right_wrist = poseCoordinates[poseLMS.RIGHT_WRIST];

	left_elbow = poseCoordinates[poseLMS.LEFT_ELBOW];
	right_elbow = poseCoordinates[poseLMS.RIGHT_ELBOW];

	left_shoulder = poseCoordinates[poseLMS.LEFT_SHOULDER];
	right_shoulder = poseCoordinates[poseLMS.RIGHT_SHOULDER];

	left_arm_angle = calculate_angle(left_shoulder, left_elbow, left_wrist);
	right_arm_angle = calculate_angle(right_shoulder, right_elbow, right_wrist);

	wristsMiddlePoint = [
		(left_wrist[0] + right_wrist[0]) / 2,
		(left_wrist[1] + right_wrist[1]) / 2,
	];

	pose1stars.forEach((star) => {
		star.runAll();
	});
}

const pose = new Pose({
	locateFile: (file: string) => {
		return path.join(__dirname, `../../../node_modules/@mediapipe/pose/${file}`);
	},
});

pose.setOptions({
	selfieMode: true,
	modelComplexity: 1,
	smoothLandmarks: true,
	enableSegmentation: false,
	minDetectionConfidence: 0.35,
	minTrackingConfidence: 0.35,
});

pose.onResults(onResults);

let stream: MediaStream | null = null;

async function setupWebcam() {
	try {
		stream = await navigator.mediaDevices.getUserMedia({
			video: {
				width: { ideal: 1080 },
				height: { ideal: 720 },
			},
		});

		videoElement.srcObject = stream;
		videoElement.play();
	} catch (error) {
		console.error("Error accessing webcam:", error);
	}
}

const runFrame = async () => {
	await pose.send({ image: videoElement });
	videoElement.requestVideoFrameCallback(runFrame);
};

videoElement.requestVideoFrameCallback(runFrame);

function stopWebcam() {
	if (stream) {
		// Stop all tracks in the stream
		stream.getTracks().forEach((track) => track.stop());
		videoElement.srcObject = null; // Optionally clear the video source
	}
}

ipcRenderer.on("start-web-game", () => {
	setupWebcam();
	document.getElementById("listgamehidden")?.classList.remove("hidden");
});

ipcRenderer.on("stop-web-game", () => {
	stopWebcam();
	document.getElementById("listgamehidden")?.classList.add("hidden");
});

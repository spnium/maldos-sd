var { setCanvasCtx, Star, poseLMS, calculate_angle, coordinatesTouching, width, height } = require("../utils.js");

let poseCoordinates = [];
for (let i = 0; i < 33; i++) {
    poseCoordinates[i] = [-1000, -1000];
}

function setpose4Coordinates(coordinates) {
    poseCoordinates = coordinates;
}

function setpose4CanvasCtx(ctx) {
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


let lLeftElbowStar = new Star(
    poseCoordinates[poseLMS.LEFT_ELBOW][0],
    poseCoordinates[poseLMS.LEFT_ELBOW][1],
    () => {
        return left_arm_angle() < 120 && left_arm_angle() > 60;
    },
    () => {
        return poseCoordinates[poseLMS.LEFT_ELBOW];
    }
);

let rRightElbowStar = new Star(
    poseCoordinates[poseLMS.RIGHT_ELBOW][0],
    poseCoordinates[poseLMS.RIGHT_ELBOW][1],
    () => {
        return right_arm_angle() < 120 && right_arm_angle() > 60;
    },
    () => {
        return poseCoordinates[poseLMS.RIGHT_ELBOW];
    }
);

let rLeftElbowStar = new Star(
    poseCoordinates[poseLMS.LEFT_ELBOW][0],
    poseCoordinates[poseLMS.LEFT_ELBOW][1],
    () => {
        // return left_arm_angle() < 65 && left_arm_angle() > 35;
        return rRightHandStar.active
    },
    () => {
        return poseCoordinates[poseLMS.LEFT_ELBOW];
    }
);

let lRightElbowStar = new Star(
    poseCoordinates[poseLMS.RIGHT_ELBOW][0],
    poseCoordinates[poseLMS.RIGHT_ELBOW][1],
    () => {
        // return right_arm_angle() < 65 && right_arm_angle() > 35;
        return lLeftHandStar.active
    },
    () => {
        return poseCoordinates[poseLMS.RIGHT_ELBOW];
    }
);

let lLeftHandStar = new Star(
    poseCoordinates[poseLMS.LEFT_PINKY][0],
    poseCoordinates[poseLMS.LEFT_PINKY][1],
    () => {
        return coordinatesTouching(
            poseCoordinates[poseLMS.LEFT_PINKY],
            poseCoordinates[poseLMS.RIGHT_ELBOW],
            [100, 100]
        );
    },
    () => {
        return poseCoordinates[poseLMS.LEFT_PINKY];
    },
    true
);

let rRightHandStar = new Star(
    poseCoordinates[poseLMS.RIGHT_INDEX][0],
    poseCoordinates[poseLMS.RIGHT_INDEX][1],
    () => {
        return coordinatesTouching(
            poseCoordinates[poseLMS.RIGHT_PINKY],
            poseCoordinates[poseLMS.LEFT_ELBOW],
            [100, 100]
        );
    },
    () => {
        return poseCoordinates[poseLMS.RIGHT_PINKY];
    },
    true
);

let pose4Lstars = [
    lLeftHandStar,
    lLeftElbowStar,
    lRightElbowStar,
];

let pose4Rstars = [
    rRightHandStar,
    rRightElbowStar,
    rLeftElbowStar,
];

module.exports = {
    setpose4Coordinates,
    setpose4CanvasCtx,
    pose4Lstars,
    pose4Rstars
};
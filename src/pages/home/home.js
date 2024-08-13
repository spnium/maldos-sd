"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const sweetalert2_1 = __importDefault(require("sweetalert2"));
// Timer
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;
const COLOR_CODES = {
    info: {
        color: "green",
    },
    warning: {
        color: "orange",
        threshold: WARNING_THRESHOLD,
    },
    alert: {
        color: "red",
        threshold: ALERT_THRESHOLD,
    },
};
let timeLeft;
let TIME_LIMIT;
electron_1.ipcRenderer.on("update-timer", (_event, arg) => {
    if (document.getElementById("timer")) {
        timeLeft = arg[0];
        TIME_LIMIT = arg[1];
        if (document.getElementById("base-timer") && timeLeft > 0) {
            updateTimer();
        }
        else {
            drawTimer();
        }
        if (!document.getElementById("start")) {
            renderButtons(timeLeft > 0 ? true : false);
        }
    }
});
function updateTimer() {
    document.getElementById("base-timer-label").innerHTML = formatTime(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
}
function drawTimer() {
    const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    let color = timeLeft <= 0 ? COLOR_CODES.alert.color : COLOR_CODES.info.color;
    document.getElementById("timer").innerHTML = `
    <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
            id="base-timer-path-remaining"
            stroke-dasharray="${circleDasharray}"
            class="base-timer__path-remaining ${color}"
            d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
            "
        ></path>
        </g>
    </svg>
    <span id="base-timer-label" class="base-timer__label">${formatTime(timeLeft)}</span>
    </div>
    `;
}
function formatTime(time) {
    if (time === 0) {
        return "00:00:00";
    }
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = Math.floor((time % 3600) % 60);
    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    if (seconds < 10) {
        seconds = `0${seconds}`;
    }
    return `${hours}:${minutes}:${seconds}`;
}
function setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = COLOR_CODES;
    let timerPathRemaining = document.getElementById("base-timer-path-remaining");
    if (timeLeft <= alert.threshold) {
        timerPathRemaining.classList.remove(warning.color);
        timerPathRemaining.classList.add(alert.color);
    }
    else if (timeLeft <= warning.threshold) {
        timerPathRemaining.classList.remove(info.color);
        timerPathRemaining.classList.add(warning.color);
    }
}
function calculateTimeFraction() {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}
function setCircleDasharray() {
    const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    document
        .getElementById("base-timer-path-remaining")
        .setAttribute("stroke-dasharray", circleDasharray);
}
// Buttons
function renderButtons(hidden) {
    let hiddenClassName = hidden ? "hidden" : "";
    document.getElementById("controls").innerHTML = `
    <button id="start" onclick="startGame()"><span>START GAME</span></button>
    <button id="snooze" class="${hiddenClassName}" onclick="snooze()">REMIND ME LATER</button>
    `;
}
electron_1.ipcRenderer.on("render-buttons", (_event, arg) => {
    if (document.getElementById("controls"))
        renderButtons(arg);
});
function startGame() {
    electron_1.ipcRenderer.send("start-game");
}
function snooze() {
    electron_1.ipcRenderer.send("snooze");
}
function showWarning() {
    sweetalert2_1.default.fire({
        title: "Warning",
        // text: "If you have one or more of the following symptoms please seek professional advice before continuing:\nUndiagnosed illnesses\nConstant muscle pain",
        html: `<span style="font-size: 18px;">If you have one or more of the following symptoms please seek professional advice before continuing:</span><br><span>-Undiagnosed illnesses<br>-Constant muscle pain</span>`,
        icon: "warning",
        confirmButtonText: "I understand",
        showConfirmButton: true,
    }).then((result) => {
        if (!result.isConfirmed) {
            electron_1.ipcRenderer.send("quit");
        }
        electron_1.ipcRenderer.send("spawn-game-process");
    });
}
const showLoading = function () {
    sweetalert2_1.default.fire({
        title: "loading",
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 3300,
    });
    sweetalert2_1.default.showLoading();
};
electron_1.ipcRenderer.on("show-warning", () => {
    showWarning();
});
electron_1.ipcRenderer.on("show-loading", () => {
    showLoading();
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const electron_store_1 = __importDefault(require("electron-store"));
const child_process_1 = require("child_process");
// import { UDPSocket } from "socket-udp";
// const socket = new UDPSocket({ port: 6969 } as any);
// const handleUDP = async () => {
// 	for await (const message of socket) {
// 		//format = "id~score"
// 		let data = message.toString("utf8").split("~");
// 		let id = +data[0];
// 		let score = +data[1];
// 		console.log(`id: ${id} score: ${score}`);
// 	}
// };
// handleUDP();
const showTimesUpNotification = () => {
    const notification = new electron_1.Notification({
        title: "Time's up!",
        body: "It's time to take a break and do some exercises.",
    });
    notification.show();
};
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    electron_1.app.quit();
}
// Hot reload
try {
    require("electron-reloader")(module);
}
catch (_) { }
const store = new electron_store_1.default();
let win = null;
let alreadyInit = false;
let TIMELIMIT = +store.get("time_limit");
if (!TIMELIMIT) {
    TIMELIMIT = 2701;
    store.set("time_limit", TIMELIMIT);
}
let soundLevel = 60;
electron_1.ipcMain.on("update-sound-level", (event, arg) => {
    soundLevel = arg;
});
let temperature = getTemperature();
let lightLevel = getLight();
let SNOOZELIMIT = 601;
let timeLimit = TIMELIMIT;
let timeLeft = timeLimit;
let timerInterval = null;
let alreadyPlayedGame = false;
const createWindow = () => {
    win = new electron_1.BrowserWindow({
        width: 1080,
        height: 720,
        icon: node_path_1.default.join(__dirname, "/pages/assets/maldos.ico"),
        resizable: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: node_path_1.default.join(__dirname, "preload.js"),
        },
    });
    win.loadFile(node_path_1.default.join(__dirname, "/pages/main_page/main.html"));
    win.webContents.openDevTools({ mode: "detach" });
    win.on("closed", () => {
        win = null;
    });
    const startTimer = () => {
        if (!timerInterval) {
            timerInterval = null;
        }
        sendToRenderer("update-timer", [timeLeft, timeLimit]);
        if (timeLeft > 0) {
            sendToRenderer("render-buttons", true);
        }
        else {
            sendToRenderer("render-buttons", false);
            showTimesUpNotification();
        }
        if (!alreadyInit) {
            alreadyInit = true;
            timerInterval = new Interval(() => {
                timeLeft -= 0.01;
                if (timeLeft < 1) {
                    sendToRenderer("update-timer", [0, timeLimit]);
                    sendToRenderer("render-buttons", false);
                    showTimesUpNotification();
                    timeLeft = 0;
                    timerInterval.stop();
                }
                else {
                    sendToRenderer("update-timer", [timeLeft, timeLimit]);
                }
            }, 10);
            timerInterval.run();
        }
    };
    const restartTimer = (t) => {
        if (timerInterval) {
            timerInterval.stop();
            timerInterval = null;
            alreadyInit = false;
        }
        timeLeft = t;
        timeLimit = t;
        startTimer();
    };
    function startGame() {
        sendToRenderer("load-page", "game");
        sendToRenderer("start-web-game", true);
    }
    const sendToRenderer = (event, arg) => {
        if (win) {
            win.webContents.send(event, arg);
        }
    };
    win.webContents.on("did-finish-load", async () => {
        win.center();
        startTimer();
        let envInterval = new Interval(async () => {
            temperature = getTemperature();
            lightLevel = getLight();
            getSound();
            sendToRenderer("update-env", [temperature, lightLevel, soundLevel]);
        }, 2000);
        envInterval.run();
    });
    electron_1.ipcMain.on("load-page", (event, page) => {
        switch (page) {
            case "home":
                win.center();
                startTimer();
                break;
            case "game":
                win.setSize(1340, 748, false);
                win.center();
            case "settings":
                sendToRenderer("render-settings", (timeLimit - 1) / 60);
                break;
            case "statistics":
                if (alreadyPlayedGame) {
                    sendToRenderer("yellow", true);
                }
                break;
            default:
                break;
        }
        if (page !== "game") {
            win.center();
            win.setSize(1080, 720, true);
            sendToRenderer("stop-web-game", true);
        }
        setTimeout(() => {
            win.center();
        }, 50);
    });
    electron_1.ipcMain.on("quit", () => {
        electron_1.app.quit();
    });
    electron_1.ipcMain.on("start-game", () => {
        sendToRenderer("show-warning", true);
    });
    electron_1.ipcMain.on("spawn-game-process", () => {
        startGame();
        sendToRenderer("show-loading", true);
        restartTimer(TIMELIMIT);
        alreadyPlayedGame = true;
    });
    electron_1.ipcMain.on("snooze", () => {
        restartTimer(SNOOZELIMIT);
    });
};
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => { });
const Interval = function (fn, duration, ...args) {
    const _this = this;
    this.baseline = undefined;
    this.run = function (flag) {
        if (_this.baseline === undefined) {
            _this.baseline = new Date().getTime() - duration;
        }
        if (flag) {
            fn(...args);
        }
        const end = new Date().getTime();
        _this.baseline += duration;
        let nextTick = duration - (end - _this.baseline);
        if (nextTick < 0) {
            nextTick = 0;
        }
        _this.timer = setTimeout(function () {
            _this.run(true);
        }, nextTick);
    };
    this.stop = function () {
        clearTimeout(_this.timer);
        _this.run = () => { };
    };
};
electron_1.ipcMain.on("set-time-limit", (event, arg) => {
    TIMELIMIT = arg * 60 + 1;
    timeLimit = TIMELIMIT;
    store.set("time_limit", TIMELIMIT);
});
function getTemperature() {
    let outputStringArr = (0, child_process_1.execSync)(`ioreg -rn AppleSmartBattery`, { encoding: "utf8" })
        .toString()
        .split("\n");
    let index = outputStringArr.findIndex((x) => x.includes('"Temperature" = '));
    let tempInt = +outputStringArr[index].replace(/\D/g, "");
    return Math.round(tempInt / 100);
    // return 32;
}
function getLight() {
    return +(0, child_process_1.execSync)(`/Users/maytanan/Desktop/maldos/src/light_sensor/light`, { encoding: "utf8" })
        .toString()
        .replace(/\D/g, "");
}
async function getSound() {
    return new Promise((resolve) => {
        (0, child_process_1.exec)("python /Users/maytanan/Desktop/maldos/src/sound_sensor/sound.py", (err, stdout, stderr) => {
            resolve(+stdout.toString().replace(/\D/g, ""));
            soundLevel = +stdout.toString().replace(/\D/g, "");
        });
        // resolve(52);
    });
}

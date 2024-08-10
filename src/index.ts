import { app, BrowserWindow, ipcMain, Notification } from "electron";
import path from "node:path";
import Store from "electron-store";
import { execSync, exec } from "child_process";

const showTimesUpNotification = () => {
	const notification = new Notification({
		title: "Time's up!",
		body: "It's time to take a break and do some exercises.",
	});
	notification.show();
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

// Hot reload
try {
	require("electron-reloader")(module);
} catch (_) {}

const store = new Store();

let win: BrowserWindow | null = null;
let alreadyInit = false;
let TIMELIMIT: number = +(store.get("time_limit") as any)!;
if (!TIMELIMIT) {
	TIMELIMIT = 2701;
	store.set("time_limit", TIMELIMIT);
}
let soundLevel = 60;

ipcMain.on("update-sound-level", (event, arg) => {
	soundLevel = arg;
});

let temperature = getTemperature();
let lightLevel = getLight();

let SNOOZELIMIT = 601;
let timeLimit = TIMELIMIT;
let timeLeft = timeLimit;

let timerInterval: any = null;

let alreadyPlayedGame = false;

const createWindow = () => {
	win = new BrowserWindow({
		width: 1080,
		height: 720,
		icon: path.join(__dirname, "/pages/assets/maldos.ico"),
		resizable: false,
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	win.loadFile(path.join(__dirname, "/pages/main_page/main.html"));
	// win.loadFile(path.join(__dirname, "/pages/login_page/login.html"));

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
		} else {
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
				} else {
					sendToRenderer("update-timer", [timeLeft, timeLimit]);
				}
			}, 10);
			timerInterval.run();
		}
	};

	const restartTimer = (t: number) => {
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

	const sendToRenderer = (event: string, arg: any) => {
		if (win) {
			win.webContents.send(event, arg);
		}
	};

	win.webContents.on("did-finish-load", async () => {
		win!.center();
		startTimer();
		let envInterval = new Interval(async () => {
			temperature = getTemperature();
			lightLevel = getLight();
			getSound();
			sendToRenderer("update-env", [temperature, lightLevel, soundLevel]);
		}, 2000);
		envInterval.run();
	});

	ipcMain.on("load-page", (event, page) => {
		switch (page) {
			case "home":
				win!.center();
				startTimer();
				break;
			case "game":
				win!.setSize(1340, 748, false);
				win!.center();
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
			win!.center();
			win!.setSize(1080, 720, true);
			sendToRenderer("stop-web-game", true);
		}
		setTimeout(() => {
			win!.center();
		}, 50);
	});

	ipcMain.on("quit", () => {
		app.quit();
	});

	ipcMain.on("start-game", () => {
		sendToRenderer("show-warning", true);
	});

	ipcMain.on("spawn-game-process", () => {
		startGame();
		sendToRenderer("show-loading", true);
		restartTimer(TIMELIMIT);
		alreadyPlayedGame = true;
	});

	ipcMain.on("snooze", () => {
		restartTimer(SNOOZELIMIT);
	});
};

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {});

const Interval = function (this: any, fn: Function, duration: number, ...args: any): void {
	const _this = this;
	this.baseline = undefined;

	this.run = function (flag: boolean) {
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
		_this.run = () => {};
	};
} as any;

ipcMain.on("set-time-limit", (event: any, arg: any) => {
	TIMELIMIT = arg * 60 + 1;
	timeLimit = TIMELIMIT;
	store.set("time_limit", TIMELIMIT);
});

function getTemperature(): number {
	let outputStringArr = execSync(`ioreg -rn AppleSmartBattery`, { encoding: "utf8" })
		.toString()
		.split("\n");
	let index = outputStringArr.findIndex((x) => x.includes('"Temperature" = '));
	let tempInt = +outputStringArr[index].replace(/\D/g, "");
	return Math.round(tempInt / 100);
	// return 32;
}

function getLight(): number {
	return +execSync(`/Users/maytanan/Desktop/maldos/src/light_sensor/light`, { encoding: "utf8" })
		.toString()
		.replace(/\D/g, "");
}

async function getSound(): Promise<number> {
	return new Promise((resolve) => {
		exec(
			"python /Users/maytanan/Desktop/maldos/src/sound_sensor/sound.py",
			(err: any, stdout: any, stderr: any) => {
				resolve(+stdout.toString().replace(/\D/g, ""));
				soundLevel = +stdout.toString().replace(/\D/g, "");
			}
		);
		// resolve(52);
	});
}
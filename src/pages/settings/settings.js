"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var { ipcRenderer } = require("electron");
document.getElementById("time_limit").oninput = function () {
    if (this.value < 0)
        this.value = 0;
    if (this.value > 90)
        this.value = 90;
    ipcRenderer.send("set-time-limit", this.value);
};
ipcRenderer.on("render-settings", (_event, arg) => {
    document.getElementById("time_limit").setAttribute("value", String(arg));
});
(_a = document.getElementById("logout_btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    ipcRenderer.send("logout");
});

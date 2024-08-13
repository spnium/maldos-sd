"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var { ipcRenderer } = require("electron");
ipcRenderer.on("yellow", () => {
    document.getElementById("yellow").classList.add("yellow");
});

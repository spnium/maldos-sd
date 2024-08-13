"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const forms = document.querySelector(".forms");
const pwShowHide = document.querySelectorAll(".eye-icon");
const links = document.querySelectorAll(".link");
var { ipcRenderer } = require("electron");
pwShowHide.forEach((eyeIcon) => {
    eyeIcon.addEventListener("click", () => {
        let pwFields = eyeIcon.parentElement.parentElement.querySelectorAll(".password");
        pwFields.forEach((password) => {
            if (password.type === "password") {
                password.type = "text";
                eyeIcon.classList.replace("bx-hide", "bx-show");
                return;
            }
            password.type = "password";
            eyeIcon.classList.replace("bx-show", "bx-hide");
        });
    });
});
links.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault(); //preventing form submit
        forms.classList.toggle("show-signup");
    });
});
function signup() {
    window.close();
    ipcRenderer.send("finish-login", true);
}

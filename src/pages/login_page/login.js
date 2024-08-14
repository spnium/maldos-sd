"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var { ipcRenderer } = require("electron");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const crypto = require("crypto");
require("dotenv/config");
var ElectronStore = require("electron-store");
const store = new ElectronStore();
let user = store.get("user");
if (user !== undefined && user !== null) {
    window.close();
    ipcRenderer.send("finish-login", true);
}
const forms = document.querySelector(".forms");
const pwShowHide = document.querySelectorAll(".eye-icon");
const links = document.querySelectorAll(".link");
const signupEmail = document.getElementById("email-signup");
const signupPassword = document.getElementById("password-signup");
const signupButton = document.getElementById("signup-btn");
const signupName = document.getElementById("name-signup");
const signupCompanyCode = document.getElementById("company-code-signup");
const loginEmail = document.getElementById("email-login");
const loginPassword = document.getElementById("password-login");
const loginButton = document.getElementById("login-btn");
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(app);
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
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
const getHash = (str) => crypto.createHash("sha1").update(str).digest("hex");
signupButton.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!validateEmail(signupEmail.value)) {
        alert("Please enter a valid email address");
        return;
    }
    let name = signupName.value;
    let companyCode = signupCompanyCode.value;
    let email = signupEmail.value;
    let password = getHash(signupPassword.value);
    let userRef;
    try {
        userRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(db, "users"), {
            username: name,
            companyCode: companyCode,
            email: email,
            password: password,
        });
        console.log("Document written with ID: ", userRef.id);
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
    try {
        const docRef = await (0, firestore_1.addDoc)((0, firestore_1.collection)(db, "scores"), {
            poseStars: [0, 0, 0, 0, 0, 0],
            userRef: userRef,
        });
        console.log("Document written with ID: ", docRef.id);
    }
    catch (e) {
        console.error("Error adding document: ", e);
    }
    store.set("scores", [0, 0, 0, 0, 0, 0]);
    alert("Account created successfully!");
    forms.classList.toggle("show-signup");
});
loginButton.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("login");
    let email = loginEmail.value;
    let password = getHash(loginPassword.value);
    console.log(email);
    console.log(password);
    const usersRef = (0, firestore_1.collection)(db, "users");
    const docQuery = (0, firestore_1.query)(usersRef, (0, firestore_1.where)("email", "==", email), (0, firestore_1.where)("password", "==", password));
    const querySnapshot = await (0, firestore_1.getDocs)(docQuery);
    if (querySnapshot.empty) {
        alert("Invalid email or password");
        return;
    }
    else {
        querySnapshot.forEach((doc) => {
            store.set("user", doc.data());
            store.set("userID", doc.id);
        });
        alert("Login successful");
        window.close();
        ipcRenderer.send("finish-login", true);
    }
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var { ipcRenderer } = require("electron");
var Swal = require("sweetalert2");
var ElectronStore = require("electron-store");
require("dotenv/config");
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
};
// Initialize Firebase
const firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(firebaseApp);
ipcRenderer.on("load-leaderboard", (_event, arg) => {
    const store = new ElectronStore();
    const userCompanyCode = store.get("user").companyCode;
    Swal.fire({
        title: "loading leaderboard",
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 500,
    });
    Swal.showLoading();
    try {
        const leaderboard = document.getElementById("leaderboard");
        const q = (0, firestore_1.query)((0, firestore_1.collection)(db, "scores"), (0, firestore_1.orderBy)("poseStars", "desc"), (0, firestore_1.limit)(999));
        (0, firestore_1.getDocs)(q).then((querySnapshot) => {
            leaderboard.innerHTML = "";
            let rank = 1;
            querySnapshot.forEach(async (scoreDoc) => {
                let stars = 0;
                scoreDoc.data().poseStars.forEach((star) => {
                    stars += star;
                });
                let name = "";
                let companyCode = "";
                const id = scoreDoc.data().userRef.id;
                const q = (0, firestore_1.query)((0, firestore_1.collection)(db, "users"), (0, firestore_1.where)((0, firestore_1.documentId)(), "==", id));
                const querySnapshot = await (0, firestore_1.getDocs)(q);
                console.log(querySnapshot);
                querySnapshot.forEach((doc) => {
                    name = doc.data().username;
                    companyCode = doc.data().companyCode;
                });
                if (querySnapshot.empty) {
                    console.log("User not found");
                }
                if (companyCode !== userCompanyCode) {
                    return;
                }
                leaderboard.innerHTML += `
                <div class="leaderboard-item">
                    <td class="rank">${rank}</td>
                    <td class="team">${name}</td>
                    <td class="points">${stars}</td>
                </div>
            `;
                rank += 1;
            });
        });
    }
    catch (error) {
        console.log(error);
    }
});

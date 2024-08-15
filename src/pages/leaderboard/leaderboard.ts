var { ipcRenderer } = require("electron");
var Swal = require("sweetalert2");
import "dotenv/config";
import { initializeApp } from "firebase/app";
import {
	collection,
	addDoc,
	getFirestore,
	query,
	where,
	getDocs,
	documentId,
	doc,
	updateDoc,
	orderBy,
	limit,
} from "firebase/firestore";

const firebaseConfig = {
	apiKey: process.env.apiKey,
	authDomain: process.env.authDomain,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

ipcRenderer.on("load-leaderboard", (_event, arg) => {
	Swal.fire({
		title: "loading leaderboard",
		allowEscapeKey: false,
		allowOutsideClick: false,
		timer: 500,
	});
	Swal.showLoading();

	try {
		const leaderboard = document.getElementById("leaderboard");

		const q = query(collection(db, "scores"), orderBy("poseStars", "desc"), limit(999));
		getDocs(q).then((querySnapshot) => {
			leaderboard!.innerHTML = "";
			let rank = 1;
			querySnapshot.forEach(async (scoreDoc) => {
				let stars = 0;
				scoreDoc.data().poseStars.forEach((star: number) => {
					stars += star;
				});
				let name = "";
				const id = scoreDoc.data().userRef.id;
				const q = query(collection(db, "users"), where(documentId(), "==", id));
				const querySnapshot = await getDocs(q);
				console.log(querySnapshot);
				querySnapshot.forEach((doc) => {
					name = doc.data().username;
				});
				if (querySnapshot.empty) {
					console.log("User not found");
				}
				leaderboard!.innerHTML += `
                <div class="leaderboard-item">
                    <td class="rank">${rank}</td>
                    <td class="team">${name}</td>
                    <td class="points">${stars}</td>
                </div>
            `;
				rank += 1;
			});
		});
	} catch (error) {
		console.log(error);
	}
});

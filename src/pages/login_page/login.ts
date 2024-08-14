var { ipcRenderer } = require("electron");
import { initializeApp } from "firebase/app";
import { collection, addDoc, getFirestore, query, where, getDocs } from "firebase/firestore";
const crypto = require("crypto");
import "dotenv/config";
var ElectronStore = require("electron-store");

const store = new ElectronStore();

let user: any = store.get("user");

if (user !== undefined && user !== null) {
	window.close();
	ipcRenderer.send("finish-login", true);
}

const forms = document.querySelector(".forms");
const pwShowHide = document.querySelectorAll(".eye-icon");
const links = document.querySelectorAll(".link");

const signupEmail = document.getElementById("email-signup") as HTMLInputElement;
const signupPassword = document.getElementById("password-signup") as HTMLInputElement;
const signupButton = document.getElementById("signup-btn") as HTMLButtonElement;
const signupName = document.getElementById("name-signup") as HTMLInputElement;
const signupCompanyCode = document.getElementById("company-code-signup") as HTMLInputElement;

const loginEmail = document.getElementById("email-login") as HTMLInputElement;
const loginPassword = document.getElementById("password-login") as HTMLInputElement;
const loginButton = document.getElementById("login-btn") as HTMLButtonElement;

const firebaseConfig = {
	apiKey: process.env.apiKey,
	authDomain: process.env.authDomain,
	projectId: process.env.projectId,
	storageBucket: process.env.storageBucket,
	messagingSenderId: process.env.messagingSenderId,
	appId: process.env.appId,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

pwShowHide.forEach((eyeIcon) => {
	eyeIcon.addEventListener("click", () => {
		let pwFields = eyeIcon.parentElement!.parentElement!.querySelectorAll(".password");

		pwFields.forEach((password: any) => {
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
		forms!.classList.toggle("show-signup");
	});
});

const validateEmail = (email: string) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
};

const getHash = (str: string) => crypto.createHash("sha1").update(str).digest("hex");

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
	let userID;

	try {
		const docRef = await addDoc(collection(db, "users"), {
			username: name,
			companyCode: companyCode,
			email: email,
			password: password,
		});
		userID = docRef.id;
		console.log("Document written with ID: ", docRef.id);
	} catch (e) {
		console.error("Error adding document: ", e);
	}

	try {
		const docRef = await addDoc(collection(db, "scores"), {
			poseStars: [0, 0, 0, 0, 0, 0],
			userRef: userID,
		});
		console.log("Document written with ID: ", docRef.id);
	} catch (e) {
		console.error("Error adding document: ", e);
	}

	alert("Account created successfully!");

	forms!.classList.toggle("show-signup");
});

loginButton.addEventListener("click", async (e) => {
	e.preventDefault();
	console.log("login");
	let email = loginEmail.value;
	let password = getHash(loginPassword.value);
	console.log(email);
	console.log(password);

	const usersRef = collection(db, "users");
	const docQuery = query(
		usersRef,
		where("email", "==", email),
		where("password", "==", password)
	);
	const querySnapshot = await getDocs(docQuery);

	if (querySnapshot.empty) {
		alert("Invalid email or password");
		return;
	} else {
		querySnapshot.forEach((doc) => {
			store.set("user", doc.data());
			store.set("userID", doc.id);
		});
		alert("Login successful");
		window.close();
		ipcRenderer.send("finish-login", true);
	}
});

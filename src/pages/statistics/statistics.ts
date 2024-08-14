var { ipcRenderer } = require("electron");
var ElectronStore = require("electron-store");

ipcRenderer.on("load-statistics", () => {
	var store = new ElectronStore();

	let starsContainers = Array.prototype.slice.call(document.getElementsByClassName("points"));
	let stars: HTMLElement[] = [];

	starsContainers.forEach((container) => {
		container.childNodes.forEach((node: any) => {
			stars.push(node);
		});
	});

	stars = stars.filter((star) => star.tagName === "I");
	stars = Array.prototype.slice.call(stars);

	let scores = store.get("scores");

	if (!scores) {
		scores = [0, 0, 0, 0, 0, 0];
		store.set("scores", scores);
	}

	for (let i = 0; i < scores.length; i++) {
		for (let j = 0; j < scores[i]; j++) {
			stars[i * 3 + j].classList.add("yellow");
		}
	}
});
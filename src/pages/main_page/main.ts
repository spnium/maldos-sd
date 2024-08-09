(<any>window).$ = (<any>window).jQuery = require("jquery");
var { ipcRenderer } = require("electron");

jQuery.ajaxSetup({ async: false });

async function loadNav(activeElementClass: string): Promise<void> {
	$(() => {
		$(".nav").load("../nav/nav.html");
	});
	await addActiveNavClass(activeElementClass);
	attachHandlersToNavs();
}

async function addActiveNavClass(activeElementClass: string) {
	return new Promise((resolve, reject) => {
		const addClassInterval = setInterval(() => {
			if ($("." + activeElementClass).hasClass("active")) {
				clearInterval(addClassInterval);
				resolve(undefined);
			} else {
				$("." + activeElementClass).addClass("active");
			}
		}, 10);
	});
}

function attachHandlersToNavs() {
	let navs = $(".nav-link");

	for (let i = 0; i < navs.length; i++) {
		if (!navs[i].classList.contains("active")) {
			navs[i].addEventListener("click", () => {
				ipcRenderer.send("nav-btn-click", navs[i].id);
				console.log(navs[i].id + " clicked");
				let name = navs[i].id.replace("-nav", "");
				loadPage(name);
			});
		}
	}
}

function loadPage(name: string) {
	loadNav(name + "-nav");
	$(() => {
		$(".page_contents").empty();
		$(".page_contents").load(`../../pages/${name}/${name}.html`);
		$.getScript(`../../pages/${name}/${name}.js`);
	});
	ipcRenderer.send("load-page", name);
}

loadPage("home");

ipcRenderer.on("load-page", (event, page) => {
	loadPage(page);
});
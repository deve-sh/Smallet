export default function registerServiceWorker() {
	if ("serviceWorker" in navigator) {
		window.addEventListener("load", function () {
			navigator.serviceWorker.register("/sw.js").then(
				function (registration) {
					console.log(
						"Service Worker registration successful with scope: ",
						registration.scope
					);
					// Creating a global service worker registration in order to use it for firebase cloud messaging.
					globalThis.globalServiceWorkerRegistration = registration;
				},
				function (err) {
					console.log("Service Worker registration failed: ", err);
				}
			);
		});
	}
}

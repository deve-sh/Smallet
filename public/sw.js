self.addEventListener("install", () => {});

importScripts("https://www.gstatic.com/firebasejs/8.0.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.0.1/firebase-messaging.js");

firebase.initializeApp({
	apiKey: "AIzaSyDcp3-sxoATLKezrdN8BabWFmpZ_SgrNtc",
	projectId: "smallet-ebb7e",
	messagingSenderId: "714877786433",
	appId: "1:714877786433:web:1f68596a905677cf3529c0",
});

const messaging = firebase.messaging();

async function receivePushNotification(event) {
	const { title, body, image, project, notificationType } = JSON.parse(
		event.data.json().data.notification
	);

	const options = {
		body,
		image,
		data: project || "",
		icon: "/icons/sprite512.png",
		vibrate: [200, 100, 200],
		badge: "/icons/sprite512.png",
		tag: notificationType,
	};

	return event.waitUntil(self.registration.showNotification(title, options));
}

async function openPushNotification(event) {
	event.notification.close();
	let urlToOpen = "http://localhost:3006";
	event.waitUntil(clients.openWindow(urlToOpen));
}

self.addEventListener("push", receivePushNotification);
self.addEventListener("notificationclick", openPushNotification);

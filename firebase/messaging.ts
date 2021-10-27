import firebase from "./index";
import "firebase/messaging";

let messaging = {
	requestPermission: async () => null,
	getToken: async (config: any) => null,
	deleteToken: async () => null,
};

try {
	messaging = firebase.messaging();
} catch (err) {}

export default messaging;

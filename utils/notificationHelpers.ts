import messaging from "../firebase/messaging";
import {
	getCloudMessagingToken,
	registerWebPushSubscription,
} from "../API/cloudmessaging";

export const subscribeUserToWebPush = async (
	subscriptionParams = { uid: "", email: "", phoneNumber: "" },
	callback
) => {
	if (globalThis.globalServiceWorkerRegistration) {
		try {
			await messaging.requestPermission();

			let currentToken = await getCloudMessagingToken();

			if (currentToken) {
				registerWebPushSubscription(
					subscriptionParams.uid,
					currentToken,
					{
						uid: subscriptionParams.uid,
						email: subscriptionParams.email,
						phoneNumber: subscriptionParams.phoneNumber,
					},
					(err) => {
						if (err) return console.error(err);
						callback(currentToken);
					}
				);
			} else {
				// Show permission request.
				console.log(
					"No registration token available. Request permission to generate one."
				);
			}
		} catch (error) {
			console.log(error);
		}
	}
};

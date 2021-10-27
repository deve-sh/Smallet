import db, { firestore } from "../firebase/firestore";
import messaging from "../firebase/messaging";

export const registerWebPushSubscription = async (
	userId: string,
	fcmToken: string,
	subscriptionParams: any,
	callback: (errorMessage: string) => any
) => {
	try {
		const userWebPushSubRef = db.collection("webpushsubs").doc(userId);

		await userWebPushSubRef.set(
			{
				updatedAt: firestore.FieldValue.serverTimestamp(),
				...subscriptionParams,
				subscriptions: firestore.FieldValue.arrayUnion(fcmToken),
			},
			{ merge: true }
		);

		return callback(null);
	} catch (err) {
		console.error(err);
		return callback(err.message);
	}
};

const getCloudMessagingToken = async () => {
	try {
		if (
			messaging &&
			messaging.getToken &&
			globalThis.globalServiceWorkerRegistration
		) {
			const publicVapidKey = process.env.NEXT_PUBLIC_WEBPUSH_VAPID_KEY;
			const token = await messaging.getToken({
				vapidKey: publicVapidKey,
				serviceWorkerRegistration: globalThis.globalServiceWorkerRegistration,
			});
			return token;
		} else return null;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const removeCloudMessagingToken = async (userId) => {
	try {
		let token = await getCloudMessagingToken();
		if (token) {
			if (messaging && messaging.deleteToken) await messaging.deleteToken();

			await db
				.collection("webpushsubs")
				.doc(userId)
				.update({
					subscriptions: firestore.FieldValue.arrayRemove(token),
					updatedAt: firestore.FieldValue.serverTimestamp(),
				});

			return true;
		}
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

export { getCloudMessagingToken };

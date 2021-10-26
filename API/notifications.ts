import { NotificationContent } from "../@types";

import db, { firestore } from "../firebase/firestore";
import auth from "../firebase/authentication";

export const getUserNotifications = async (
	userId: string,
	startAfter: any,
	callback: (errorMessage: string | null, notifications?: Array<object>) => any
) => {
	try {
		let userNotificationsRef = db
			.collection("notifications")
			.where("user", "==", userId)
			.where("read", "==", false);

		if (startAfter)
			userNotificationsRef = userNotificationsRef.startAfter(startAfter);

		userNotificationsRef = userNotificationsRef
			.limit(10)
			.orderBy("createdAt", "desc");

		const userNotifications = await userNotificationsRef.get();
		return callback(
			null,
			userNotifications.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}))
		);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

export const markNotificationsAsRead = async (
	notificationIds: [string],
	callback: (errorMessage: string | null) => any
) => {
	try {
		const batch = db.batch();

		for (let id of notificationIds) {
			batch.update(db.collection("notifications").doc(id), {
				updatedAt: firestore.FieldValue.serverTimestamp(),
				read: true,
			});
		}

		await batch.commit();
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

export const createUserNotification = async (
	userId: string,
	notificationContent: NotificationContent,
	callback: (errorMessage: string | null) => any
) => {
	try {
		const notificationDoc = db.collection("notifications").doc();
		await notificationDoc.set({
			...notificationContent,
			user: userId,
			createdAt: firestore.FieldValue.serverTimestamp(),
			updatedAt: firestore.FieldValue.serverTimestamp(),
			createdBy: auth.currentUser?.uid,
		});
		return callback(null);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

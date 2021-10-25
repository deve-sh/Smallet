import db, { firestore } from "../firebase/firestore";
import auth from "../firebase/authentication";

export const getUserDetails = async (userId: string) => {
	try {
		return (await db.collection("users").doc(userId).get()).data();
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return null;
	}
};

interface FirestoreUserUpdates {
	email?: string | null;
	displayName?: string | null;
	photoURL?: string | null;
	phoneNumber?: string;
}

export const updateUserDetails = async (
	userId: string,
	updates: FirestoreUserUpdates,
	callback: (error: string | null) => any
) => {
	try {
		await auth.currentUser.updateProfile(updates);
		await db
			.collection("users")
			.doc(userId)
			.update({
				...updates,
				updatedAt: firestore.FieldValue.serverTimestamp(),
			});
		return callback(null);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

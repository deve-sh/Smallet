import { EmailOptions, FirebaseUser } from "../@types";
import db, { firestore } from "../firebase/firestore";
import auth, { getToken } from "../firebase/authentication";
import request from "../utils/request";

export const getUserDetails = async (userId: string) => {
	try {
		return (await db.collection("users").doc(userId).get()).data();
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return null;
	}
};

export const updateUserDetails = async (
	updates: FirebaseUser,
	callback: (error: string | null) => any
) => {
	try {
		await auth.currentUser.updateProfile(updates);
		await db
			.collection("users")
			.doc(auth.currentUser.uid)
			.set(
				{
					...updates,
					updatedAt: firestore.FieldValue.serverTimestamp(),
				},
				{ merge: true }
			);
		return callback(null);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

export const getWalletDetails = async (
	userId: string,
	callback: (errorMessage: string | null, walletInfo: any) => any
) => {
	try {
		return callback(
			null,
			(await db.collection("wallets").doc(userId).get()).data()
		);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message, null);
	}
};

export const getWalletRef = (userId: string) =>
	db.collection("wallets").doc(userId);

export const getUserByPhoneOrEmail = async (
	userIdentifier: string,
	userIdsToExclude: string[],
	callback: (errorMessage: string | null, userList?: any[]) => any
) => {
	try {
		const usersAlreadyMapped = {};
		const options = [];

		const phoneIdentifier = userIdentifier?.startsWith("+")
			? userIdentifier
			: "+91" + userIdentifier;
		const usersByPhone = await db
			.collection("users")
			.where("phoneNumber", "==", phoneIdentifier)
			.limit(2)
			.get();
		const usersByEmail = await db
			.collection("users")
			.where("email", "==", userIdentifier)
			.limit(2)
			.get();
		for (let user of usersByPhone.docs) {
			if (
				!(user.id in usersAlreadyMapped) &&
				!userIdsToExclude.includes(user.id)
			) {
				usersAlreadyMapped[user.id] = true;
				options.push({ id: user.id, ...user.data() });
			}
		}
		for (let user of usersByEmail.docs) {
			if (
				!(user.id in usersAlreadyMapped) &&
				!userIdsToExclude.includes(user.id)
			) {
				usersAlreadyMapped[user.id] = true;
				options.push({ id: user.id, ...user.data() });
			}
		}
		return callback(null, options);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message, null);
	}
};

export const sendEmailToUsers = async (
	toUser: string | null,
	emailOptions: EmailOptions,
	callback: (errorMessage: string | null, response?: any) => any
) => {
	try {
		// Get details of user to send email to.
		if (toUser && !emailOptions.to) {
			const user = (await db.collection("users").doc(toUser).get()).data();
			if (!user) return callback("User not found to send email to.");
			else if (!user.email) return callback("User doesn't have email enabled.");
			emailOptions.to = user.email;
		}

		request(
			"/api/sendEmail",
			emailOptions,
			{ headers: { authorization: await getToken() } },
			"post",
			(error, response) => {
				if (error) return callback(error);
				return callback(null, response);
			}
		);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message, null);
	}
};

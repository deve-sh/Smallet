import { FirebaseUser } from "../@types";
import auth, { firebaseAuth, providers } from "../firebase/authentication";
import db, { firestore } from "../firebase/firestore";

export const loginWithGoogle = async (
	callback: (errorMessage: string | null) => any
) => {
	try {
		if (!auth.currentUser) {
			await auth.signInWithPopup(providers.googleProvider);
			return callback(null);
		} else return callback("User already signed in.");
	} catch (err) {
		console.log(err);
		return callback(err.message);
	}
};

// OTP Based Login

export async function setupRecaptchaVerifier(
	callback: (errorMessage: string | null, recaptchaVerifier: any) => any
) {
	try {
		window["recaptchaVerifier"] = new firebaseAuth.RecaptchaVerifier(
			"recaptcha-container",
			{ size: "invisible" }
		);
		return callback(null, window["recaptchaVerifier"]);
	} catch (err) {
		if (process.env.NODE_ENV === "development") console.log(err);
		return callback(err.message, null);
	}
}

export async function sendOTPToUser(
	phoneNumber: string,
	callback: (errorMessage: string | null, confirmationResult: any) => any
) {
	try {
		const confirmationResult = await auth.signInWithPhoneNumber(
			phoneNumber,
			window["recaptchaVerifier"]
		);
		return callback(null, confirmationResult);
	} catch (err) {
		if (process.env.NODE_ENV === "development") console.log(err);
		return callback(err.message, null);
	}
}

interface OTPConfirmationResult {
	confirm: (otp: string) => any;
}

export async function submitOTP(
	confirmationResult: OTPConfirmationResult,
	OTP: string,
	callback: (errorMessage: string | null, userResult: any) => any
) {
	try {
		const user = await confirmationResult.confirm(OTP);
		return callback(null, user);
	} catch (err) {
		if (process.env.NODE_ENV === "development") console.log(err);
		return callback(err.message, null);
	}
}

export const saveUserDetailsToDatabase = async (
	userId: string,
	userDetails: FirebaseUser,
	callback: (errorMessage: string | null) => any
) => {
	try {
		const userRef = db.collection("users").doc(userId);

		const user = await userRef.get();
		const batch = db.batch();

		if (user.exists) {
			batch.update(userRef, userDetails);
		} else {
			// New user, lots of processing.
			// Create wallet document
			batch.set(
				db.collection("wallets").doc(userId),
				{
					balance: 0,
					nTransactions: 0,
					user: userId,
					id: userId,
					createdAt: firestore.FieldValue.serverTimestamp(),
					updatedAt: firestore.FieldValue.serverTimestamp(),
				},
				{ merge: true }
			);
			// Set User Document
			batch.set(
				userRef,
				{
					...userDetails,
					createdAt: firestore.FieldValue.serverTimestamp(),
					updatedAt: firestore.FieldValue.serverTimestamp(),
					id: userId,
				},
				{ merge: true }
			);
			// Create a 'complete your profile now' notification.
			batch.set(db.collection("notifications").doc(), {
				user: userId,
				type: "profile",
				text: "Welcome to Smallet! Complete your profile now!",
				read: false,
				createdBy: userId,
				url: "/user/profile",
				createdAt: firestore.FieldValue.serverTimestamp(),
				updatedAt: firestore.FieldValue.serverTimestamp(),
			});
		}

		await batch.commit();
		return callback(null);
	} catch (err) {
		if (process.env.NODE_ENV === "development") console.log(err);
		return callback(err.message);
	}
};

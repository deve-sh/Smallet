import auth, { firebaseAuth, providers } from "../firebase/authentication";

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

import admin from "../firebase/admin";

export const validateIdToken = async (token) => {
	try {
		const decodedToken = await admin.auth().verifyIdToken(token);
		return decodedToken;
	} catch (err) {
		return null;
	}
};

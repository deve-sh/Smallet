// File to house the global authentication ref of firebase.

import cookie from "js-cookie";
import firebase from "./index";
import mainFirebase from "firebase/app";
import "firebase/auth";

const auth = firebase.auth();

// Providers
const googleProvider = new mainFirebase.auth.GoogleAuthProvider();
const githubProvider = new mainFirebase.auth.GithubAuthProvider();

export default auth;
export const firebaseAuth = mainFirebase.auth;
export const providers = { googleProvider, githubProvider, mainFirebase };

const getToken = async (refreshToken = true) => {
	if (auth.currentUser) {
		const token = await auth.currentUser.getIdToken(refreshToken);
		cookie.set("accessToken", token);
		return token;
	} else return cookie.get("accessToken") || "";
};

export { getToken };

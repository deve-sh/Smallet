import firebase from "firebase/app";

const firebasePrimaryApp = !firebase.apps.length
	? firebase.initializeApp(
			JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG.replace(/\\"/g, '"'))
	  )
	: firebase.apps[0];

export default firebasePrimaryApp;

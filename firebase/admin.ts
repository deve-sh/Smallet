import admin from "firebase-admin";

import firebaseServiceAccount from "../keys/firebase-service-account";

const serviceAccount = JSON.parse(firebaseServiceAccount);

if (!admin.apps.length) {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	});
}

export default admin;

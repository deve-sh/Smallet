import { FirebaseUser } from "../@types";
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

// Wallet Transactions
export const getWalletTransactions = async (
	walletId: string,
	startAfter: any,
	callback: (errorMessage: string | null, transactionList: any) => any
) => {
	try {
		let transactionsRef = db
			.collection("wallettransactions")
			.where("wallet", "==", walletId)
			.orderBy("updatedAt", "desc");
		if (startAfter) transactionsRef = transactionsRef.startAfter(startAfter);
		transactionsRef = transactionsRef.limit(5);

		return callback(null, await transactionsRef.get());
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message, null);
	}
};

import request from "../utils/request";
import { getToken } from "../firebase/authentication";
import db, { firestore } from "../firebase/firestore";

export const createAddMoneyToWalletTransaction = async (
	transactionInfo: { amount: number; title?: string; description?: string },
	callback: (errorMessage: string | null, orderInfo?: any) => any
) => {
	try {
		if (!transactionInfo.amount) return callback("Amount invalid");
		request(
			"/api/createWalletAddMoneyTransaction",
			{
				amount: transactionInfo.amount,
				title: transactionInfo.title,
				description: transactionInfo.description,
			},
			{ headers: { authorization: await getToken() } },
			"post",
			(error, response) => {
				if (error) return callback(error);
				return callback(null, response);
			}
		);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

export const createWalletMoneyTransferTransaction = async (
	amount: number,
	userToTransferTo: string,
	callback: (errorMessage: string | null, orderInfo?: any) => any
) => {
	try {
		if (!amount || !userToTransferTo) return callback("Amount or user invalid");
		request(
			"/api/transferMoneyToOtherWallet",
			{ amount, userToTransferTo },
			{ headers: { authorization: await getToken() } },
			"post",
			(error, response) => {
				if (error) return callback(error);
				return callback(null, response);
			}
		);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

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

interface PaymentRequestInformation {
	amount: number;
	title?: string;
	description?: string;
}

export const createPaymentRequest = async (
	userId: string,
	userToRequestFrom: string,
	information: PaymentRequestInformation,
	callback: (errorMessage: string | null) => any
) => {
	try {
		if (!userId || !userToRequestFrom || userId === userToRequestFrom) return;

		const paymentRequestRef = db.collection("paymentrequests").doc();
		await paymentRequestRef.set({
			fromUser: userId,
			toUser: userToRequestFrom,
			...information,
			createdAt: firestore.FieldValue.serverTimestamp(),
			updatedAt: firestore.FieldValue.serverTimestamp(),
			status: "pending",
		});

		return callback(null);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

export const declinePaymentRequest = async (
	paymentRequestId: string,
	callback: (errorMessage: string | null) => any
) => {
	try {
		const paymentRequestRef = db
			.collection("paymentrequests")
			.doc(paymentRequestId);
		await paymentRequestRef.update({
			status: "declined",
			updatedAt: firestore.FieldValue.serverTimestamp(),
		});

		return callback(null);
	} catch (err) {
		if (process.env.NODE_ENV !== "production") console.log(err);
		return callback(err.message);
	}
};

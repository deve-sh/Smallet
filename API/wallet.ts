import request from "../utils/request";
import { getToken } from "../firebase/authentication";
import db from "../firebase/firestore";

export const createAddMoneyToWalletTransaction = async (
	amount: number,
	callback: (errorMessage: string | null, orderInfo?: any) => any
) => {
	try {
		if (!amount) return callback("Amount invalid");
		request(
			"/api/createWalletAddMoneyTransaction",
			{ amount },
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

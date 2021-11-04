import type { NextApiRequest, NextApiResponse } from "next";
import admin from "../../firebase/admin";
import { validateIdToken } from "../../utils/firebaseAdminUtils";

export default async function transferMoneyToOtherWallet(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const error = (status, message) =>
		res.status(status).json({
			error: message,
			message,
		});

	try {
		let { amount, userToTransferTo, paymentRequestId } = req.body; // amount -> Paise
		const { authorization } = req.headers;

		if (!authorization || !paymentRequestId || !amount || !userToTransferTo)
			return error(400, "Invalid information.");

		amount = Number(amount) || 0;

		// Get user details from token.
		const decodedToken = await validateIdToken(authorization);
		if (!decodedToken) return error(401, "Unauthorized");

		if (decodedToken.uid === userToTransferTo)
			return error(401, "You can't transfer money to yourself.");

		const userFromWalletRef = admin
			.firestore()
			.collection("wallets")
			.doc(decodedToken.uid);

		const userToWalletRef = admin
			.firestore()
			.collection("wallets")
			.doc(userToTransferTo);

		let paymentRequestRef = null;

		if (paymentRequestId) {
			paymentRequestRef = admin
				.firestore()
				.collection("paymentrequests")
				.doc(paymentRequestId);
			const paymentRequestInfo = (await paymentRequestRef.get()).data();
			if (!paymentRequestInfo)
				return error(404, "Payment Request Info Not Found");
			amount = Number(paymentRequestInfo.amount);
		}

		const userFromWallet = (await userFromWalletRef.get()).data();
		const userToWallet = (await userFromWalletRef.get()).data();

		const fromTransactionRef = admin
			.firestore()
			.collection("wallettransactions")
			.doc();
		const toTransactionRef = admin
			.firestore()
			.collection("wallettransactions")
			.doc();

		if (!userFromWallet || !userToWallet)
			return error(404, "Wallets not found");

		if (Number(userFromWallet.balance) < Number(amount))
			return error(400, "You don't have sufficient balance for transfer");

		const fromUser = (
			await admin.firestore().collection("users").doc(decodedToken.uid).get()
		).data();
		const toUser = (
			await admin.firestore().collection("users").doc(userToTransferTo).get()
		).data();

		const batch = admin.firestore().batch();

		if (paymentRequestRef) {
			batch.update(paymentRequestRef, {
				status: "paid",
				updatedAt: new Date(),
			});
		}
		batch.update(userFromWalletRef, {
			balance: admin.firestore.FieldValue.increment(-amount),
			nTransactions: admin.firestore.FieldValue.increment(1),
			nSuccessfulTransactions: admin.firestore.FieldValue.increment(1),
			lastTransaction: -amount,
			updatedAt: new Date(),
		});
		batch.update(userToWalletRef, {
			balance: admin.firestore.FieldValue.increment(amount),
			nTransactions: admin.firestore.FieldValue.increment(1),
			nSuccessfulTransactions: admin.firestore.FieldValue.increment(1),
			lastTransaction: amount,
			updatedAt: new Date(),
		});
		batch.set(fromTransactionRef, {
			user: decodedToken.uid,
			amount: -amount,
			wallet: decodedToken.uid,
			to: userToTransferTo,
			from: decodedToken.uid,
			createdAt: new Date(),
			updatedAt: new Date(),
			status: "paid",
			type: "money_transfer",
			order: null,
			paymentRequest: req.body.paymentRequestId,
			partnerTransaction: toTransactionRef.id,
			title: `Transfer of ₹${Number(Math.abs(amount) / 100).toFixed(2)} to ${
				toUser?.displayName || toUser?.phoneNumber || toUser?.email
			}.`,
			description: "",
		});
		batch.set(toTransactionRef, {
			from: decodedToken.uid,
			user: userToTransferTo,
			to: userToTransferTo,
			amount,
			wallet: userToTransferTo,
			updatedAt: new Date(),
			createdAt: new Date(),
			status: "paid",
			type: "money_transfer",
			order: null,
			paymentRequest: req.body.paymentRequestId,
			partnerTransaction: fromTransactionRef.id,
			title: `Transfer of ₹${Number(Math.abs(amount) / 100).toFixed(2)} from ${
				fromUser?.displayName || fromUser?.phoneNumber || fromUser?.email
			}.`,
			description: "",
		});
		batch.update(admin.firestore().collection("users").doc(userToTransferTo), {
			nTransactions: admin.firestore.FieldValue.increment(1),
			updatedAt: new Date(),
		});
		batch.update(admin.firestore().collection("users").doc(decodedToken.uid), {
			nTransactions: admin.firestore.FieldValue.increment(1),
			updatedAt: new Date(),
		});

		await batch.commit();

		return res.status(200).json({
			message: "Successfully transferred money to user's wallet.",
			success: true,
		});
	} catch (err) {
		console.log(err);
		return error(500, err.message);
	}
}

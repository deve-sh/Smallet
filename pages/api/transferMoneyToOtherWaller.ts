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
		const { amount, userToTransferTo } = req.body; // amount -> Paise
		const { authorization } = req.headers;

		if (!authorization || !amount || !userToTransferTo)
			return error(400, "Invalid information.");

		// Get user details from token.
		const decodedToken = await validateIdToken(authorization);
		if (!decodedToken) return error(401, "Unauthorized");

		const userFromWalletRef = admin
			.firestore()
			.collection("wallets")
			.doc(decodedToken.uid);

		const userToWalletRef = admin
			.firestore()
			.collection("wallets")
			.doc(userToTransferTo);

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

		const batch = admin.firestore().batch();

		batch.update(userFromWalletRef, {
			balance: admin.firestore.FieldValue.increment(-amount),
			updatedAt: new Date(),
		});
		batch.update(userToWalletRef, {
			balance: admin.firestore.FieldValue.increment(amount),
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
			partnerTransaction: toTransactionRef.id,
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
			partnerTransaction: fromTransactionRef.id,
		});

		await batch.commit();

		return res
			.status(200)
			.json({ message: "Successfully transferred money to user's wallet." });
	} catch (err) {
		console.log(err);
		return error(500, err.message);
	}
}

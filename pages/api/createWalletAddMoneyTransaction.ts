import type { NextApiRequest, NextApiResponse } from "next";
import razorpay from "../../utils/razorpay";
import admin from "../../firebase/admin";
import { validateIdToken } from "../../utils/firebaseAdminUtils";

export default async function createWalletAddMoneyTransaction(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const error = (status, message) =>
		res.status(status).json({
			error: message,
			message,
		});

	try {
		const { amount } = req.body; // amount -> Paise
		const { authorization } = req.headers;

		if (!authorization || !amount) return error(400, "Invalid information.");

		// Get user details from token.
		const decodedToken = await validateIdToken(authorization);
		if (!decodedToken) return error(401, "Unauthorized");

		const batch = admin.firestore().batch();
		const transactionRef = admin
			.firestore()
			.collection("wallettransactions")
			.doc();
		const userRef = admin.firestore().collection("users").doc(decodedToken.uid);
		const walletRef = admin
			.firestore()
			.collection("wallets")
			.doc(decodedToken.uid);

		const order = await razorpay.orders.create({
			amount,
			currency: "INR",
			receipt: transactionRef.id,
			notes: {
				transactionId: transactionRef.id,
				user: decodedToken.uid,
			},
		});

		if (order) {
			const orderRef = admin.firestore().collection("orders").doc(order.id);
			batch.set(transactionRef, {
				user: decodedToken.uid,
				amount,
				wallet: decodedToken.uid,
				createdAt: new Date(),
				updatedAt: new Date(),
				status: "pending",
				type: "wallet_topup",
				order: order.id,
			});
			batch.set(orderRef, {
				...order,
				user: decodedToken.uid,
				amount,
				wallet: decodedToken.uid,
				transaction: transactionRef.id,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			batch.update(userRef, {
				nTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
			});
			batch.update(walletRef, {
				nTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
			});
			await batch.commit();
			return res
				.status(201)
				.json({ message: "Created Order Successfully", order });
		}
		return error(500, "Payment could not be created.");
	} catch (err) {
		console.log(err);
		return error(500, err.message);
	}
}

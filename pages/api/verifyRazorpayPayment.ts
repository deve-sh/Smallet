import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";

import admin from "../../firebase/admin";
import { validateIdToken } from "../../utils/firebaseAdminUtils";
import razorpay from "../../utils/razorpay";

export default async function verifyRazorpayPayment(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const error = (status: number, message: string) =>
		res.status(status).json({
			error: message,
			message,
		});

	try {
		const {
			status = "successful",
			razorpay_payment_id,
			razorpay_order_id,
			razorpay_signature,
			razorpayError,
		} = req.body;
		const { authorization } = req.headers;

		if (!razorpay_order_id || !authorization)
			return error(400, "Incomplete Information");

		// Get user details from token.
		const decodedToken = await validateIdToken(authorization);
		if (!decodedToken) return error(401, "Unauthorized");

		const orderRef = admin
			.firestore()
			.collection("orders")
			.doc(razorpay_order_id);

		const orderData = (await orderRef.get()).data();

		if (!orderData || orderData.user !== decodedToken.uid)
			return error(404, "Payment not found.");
		else if (orderData.status !== "created")
			return error(400, "Payment has already been processed.");

		const transactionRef = admin
			.firestore()
			.collection("wallettransactions")
			.doc(orderData.transaction);
		const transactionData = (await transactionRef.get()).data();

		if (!transactionData || transactionData.user !== decodedToken.uid)
			return error(404, "Transaction not found.");

		const batch = admin.firestore().batch();

		const walletRef = admin
			.firestore()
			.collection("wallets")
			.doc(decodedToken.uid);
		const userRef = admin.firestore().collection("users").doc(decodedToken.uid);

		const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
		if (!razorpayOrder) return error(404, "Order info not found.");

		if (status === "successful") {
			if (!razorpay_payment_id || !razorpay_signature)
				return error(400, "Incomplete Information");

			// Verifying signature
			const generatedSignature = createHmac(
				"sha256",
				process.env.RAZORPAY_KEY_SECRET
			)
				.update(razorpay_order_id + "|" + razorpay_payment_id)
				.digest("hex");

			if (generatedSignature != razorpay_signature)
				return error(403, "Unauthorized");

			const orderPayments = await razorpay.orders.fetchPayments(
				razorpay_order_id
			);
			batch.update(orderRef, {
				...razorpayOrder,
				payments: orderPayments,
				updatedAt: new Date(),
			});
			batch.update(transactionRef, {
				status: "paid",
				updatedAt: new Date(),
			});
			batch.update(walletRef, {
				nSuccessfulTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
				lastTransaction: razorpayOrder.amount,
				balance: admin.firestore.FieldValue.increment(razorpayOrder.amount),
			});
			batch.update(userRef, {
				nSuccessfulTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
			});
		} else {
			// Payment failure setting.
			if (!razorpayError) return error(400, "Incomplete Information");
			batch.update(orderRef, {
				...razorpayOrder,
				payments: [],
				updatedAt: new Date(),
			});
			batch.update(transactionRef, {
				status: "failed",
				error: razorpayError,
				updatedAt: new Date(),
			});
			batch.update(walletRef, {
				nFailedTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
			});
			batch.update(userRef, {
				nFailedTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
			});
		}

		await batch.commit();
		return res.status(200).json({ message: "Updated wallet successfully." });
	} catch (err) {
		console.log(err);
		return error(500, err.message);
	}
}

import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";

import admin from "../../firebase/admin";
import { validateIdToken } from "../../utils/firebaseAdminUtils";
import razorpay from "../../utils/razorpay";

export default async function verifyRazorpayPayment(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const error = (status, message) =>
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
			error = {},
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

		if (!orderData.exists || orderData.user !== decodedToken.uid)
			return error(404, "Payment not found.");
		else if (orderData.status !== "created")
			return error(400, "Payment has already been processed.");

		const transactionRef = admin
			.firestore()
			.collection("wallettransactions")
			.doc(orderData.transaction);
		const transactionData = (await transactionRef.get()).data();

		if (!transactionData.exists || transactionData.user !== decodedToken.uid)
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
				.update(razorpay_payment_id + "|" + razorpay_payment_id)
				.digest("hex");

			if (generatedSignature != razorpay_signature)
				return error(403, "Unauthorized");

			const orderPayments = await razorpay.orders.fetchPayments(
				razorpay_order_id
			);
			batch.update(orderRef, {
				...razorpayOrder,
				payments: orderPayments,
				updatedAt: new Date().getTime(),
			});
			batch.update(transactionRef, {
				status: "paid",
				updatedAt: new Date().getTime(),
			});
			batch.update(walletRef, {
				nTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
				balance: admin.firestore.FieldValue.increment(razorpayOrder.amount),
			});
			batch.update(userRef, {
				nTransactions: admin.firestore.FieldValue.increment(1),
				updatedAt: new Date(),
			});
		} else {
			// Payment failure setting.
			if (!error) return error(400, "Incomplete Information");
			batch.update(orderRef, {
				...razorpayOrder,
				payments: [],
				updatedAt: new Date().getTime(),
			});
			batch.update(transactionRef, {
				status: "failed",
				updatedAt: new Date().getTime(),
			});
		}

		await batch.commit();
		return res.status(200).json({ message: "Updated wallet successfully." });
	} catch (err) {
		console.log(err);
		return error(500, err.message);
	}
}

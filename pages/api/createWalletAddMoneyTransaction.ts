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
		const orderRef = admin.firestore().collection("orders").doc();

		batch.set(transactionRef, {
			user: decodedToken.uid,
			amount,
			wallet: decodedToken.uid,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		batch.set(orderRef, {
			user: decodedToken.uid,
			amount,
			wallet: decodedToken.uid,
			transaction: transactionRef.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		razorpay.orders.create(
			{
				amount,
				currency: "INR",
				receipt: orderRef.id,
			},
			(err, order) => {
				if (err) return error(500, err.message);
				console.log(order);
				return res
					.status(201)
					.json({ message: "Created Order Successfully", order });
			}
		);
	} catch (err) {
		console.log(err);
		return error(500, err.message);
	}
}

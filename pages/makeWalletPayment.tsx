/* Dedicated Page to make wallet payments. */

import { useRef, useState } from "react";
import Script from "next/script";
import styled from "@emotion/styled";
import { Container, Text, Image } from "@chakra-ui/react";

import db from "../firebase/firestore";
import useStore from "../hooks/useStore";
import setupProtectedRoute from "../utils/setupProtectedRoute";
import toasts from "../utils/toasts";
import request from "../utils/request";
import { getToken } from "../firebase/authentication";

import Error from "../components/Layout/Error";

const WalletImage = styled(Image)`
	max-width: 45vw;
`;

const MakeWalletPayment = ({ error, orderInfo, transactionInfo }) => {
	const user = useStore((state) => state.user);

	const paymentFailuresCount = useRef(0);
	const [errorMessage, setErrorMessage] = useState(error);
	const [transactionState, setTransactionState] = useState("not-started");

	function initializePayment() {
		if (
			orderInfo.status !== "created" ||
			transactionInfo.status === "paid" ||
			transactionInfo.status === "failed"
		)
			return setErrorMessage(
				"Payment process has already taken place. Please check back in some time."
			);
		if (user.uid !== orderInfo.user) return setErrorMessage("Unauthorized");

		const options = {
			key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
			amount: orderInfo.amount,
			currency: orderInfo.currency,
			name: "Smallet",
			description: "Smallet Money Loading Transaction",
			image: "https://smallet.vercel.app/logo512.png",
			order_id: orderInfo.id,
			handler: async (response) => {
				request(
					"/api/verifyRazorpayPayment",
					{
						razorpay_payment_id: response.razorpay_payment_id,
						razorpay_order_id: response.razorpay_order_id,
						razorpay_signature: response.razorpay_signature,
						status: "successful",
					},
					{ headers: { authorization: await getToken() } },
					"post",
					(error) => {
						if (error) {
							setTransactionState("failed");
							return toasts.generateError(error);
						}
						setTransactionState("successful");
						toasts.generateSuccess("Payment Successful");
					}
				);
			},
			prefill: {
				name: user?.displayName || "",
				email: user?.email || "",
				contact: user?.phoneNumber || "",
			},
			notes: {},
			theme: {
				color: "#008080",
			},
		};
		const razorpayPaymentInstance = new globalThis.Razorpay(options);
		razorpayPaymentInstance.on("payment.failed", async (response) => {
			paymentFailuresCount.current = paymentFailuresCount.current + 1;
			if (paymentFailuresCount.current >= 3) {
				// Mark the entire payment as failed.
				setTransactionState("failed");
				setErrorMessage(
					response.error.description +
						". Please try creating another wallet transaction."
				);
				request(
					"/api/verifyRazorpayPayment",
					{
						razorpay_payment_id: response.error.metadata.payment_id,
						razorpay_order_id: orderInfo.id,
						razorpayError: response.error,
						status: "error",
					},
					{ headers: { authorization: await getToken() } },
					"post",
					(error) => {
						if (error) {
							setTransactionState("failed");
							return toasts.generateError(error);
						}
					}
				);
				razorpayPaymentInstance.close();
			}
			console.log(
				"Payment Failed: ",
				response.error.code,
				response.error.description,
				response.error.source,
				response.error.step,
				response.error.reason,
				response.error.metadata.order_id,
				response.error.metadata.payment_id
			);
		});

		razorpayPaymentInstance.open();
		setTransactionState("started");
	}

	return errorMessage ? (
		<Error errorMessage={errorMessage} />
	) : (
		<Container maxW="container.xl" centerContent padding="2rem">
			<WalletImage src="/wallet.svg" objectFit="cover" alt="Wallet" />
			<br />
			<Text fontSize="lg" colorScheme="gray">
				{transactionState === "not-started"
					? "Transaction starting"
					: transactionState === "started"
					? "Transaction In Progress"
					: transactionState === "successful"
					? "Transaction Successful. Your Balance will reflect in your wallet soon."
					: "Transaction Failed"}
			</Text>
			<Script
				src="https://checkout.razorpay.com/v1/checkout.js"
				onLoad={initializePayment}
			/>
		</Container>
	);
};

MakeWalletPayment.getInitialProps = setupProtectedRoute(async (context) => {
	try {
		const { query } = context;

		if (!query.orderId) return { error: "Invalid Payment Session" };

		// Fetch order info from firestore.
		const orderInfo = (
			await db.collection("orders").doc(query.orderId).get()
		).data();

		if (!orderInfo) return { error: "Payment Information Not Found" };

		const transactionInfo = (
			await db.collection("wallettransactions").doc(orderInfo.transaction).get()
		).data();

		if (!transactionInfo) return { error: "Transaction Not Found" };

		return { orderInfo, transactionInfo, user: orderInfo.user };
	} catch (err) {
		console.log(err);
		return { error: err.message };
	}
});

export default MakeWalletPayment;

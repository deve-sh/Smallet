/* Dedicated Page to make wallet payments. */

import { useState } from "react";
import Script from "next/script";
import styled from "@emotion/styled";
import { Container, Text, Image } from "@chakra-ui/react";

import db from "../firebase/firestore";
import useStore from "../hooks/useStore";
import setupProtectedRoute from "../utils/setupProtectedRoute";

import Error from "../components/Layout/Error";

const WalletImage = styled(Image)`
	max-width: 45vw;
`;

const MakeWalletPayments = ({ error, orderInfo, transactionInfo }) => {
	const user = useStore((state) => state.user);

	const [errorMessage, setErrorMessage] = useState(error);
	const [transactionState, setTransactionState] = useState("not-started");

	function initializePayment() {
		if (user.uid !== orderInfo.user) return;

		const options = {
			key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
			amount: orderInfo.amount,
			currency: orderInfo.currency,
			name: "Smallet",
			description: "Smallet Money Loading Transaction",
			image: "https://smallet.vercel.app/logo512.png",
			order_id: orderInfo.id,
			handler: function (response) {
				setTransactionState("successful");
				console.log("Payment Successful: ");
				console.log(response.razorpay_payment_id);
				console.log(response.razorpay_order_id);
				console.log(response.razorpay_signature);
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
		razorpayPaymentInstance.on("payment.failed", (response) => {
			setTransactionState("failed");
			setErrorMessage(response.error.description);
			console.log(response.error.code);
			console.log(response.error.description);
			console.log(response.error.source);
			console.log(response.error.step);
			console.log(response.error.reason);
			console.log(response.error.metadata.order_id);
			console.log(response.error.metadata.payment_id);
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

MakeWalletPayments.getInitialProps = setupProtectedRoute(async (context) => {
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

export default MakeWalletPayments;

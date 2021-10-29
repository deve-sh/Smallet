/* Dedicated Page to make wallet payments. */
import Script from "next/script";
import { useRouter } from "next/router";
import db from "../firebase/firestore";
import useStore from "../hooks/useStore";
import setupProtectedRoute from "../utils/setupProtectedRoute";

const MakeWalletPayments = ({ error, orderInfo, transaction }) => {
	const router = useRouter();
	const user = useStore((state) => state.user);

	function initializePayment() {
		const options = {
			key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
			amount: orderInfo.amount,
			currency: orderInfo.currency,
			name: "Smallet",
			description: "Smallet Money Loading Transaction",
			image: "https://smallet.vercel.app/logo512.png",
			order_id: orderInfo.id,
			handler: function (response) {
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
			console.log(response.error.code);
			console.log(response.error.description);
			console.log(response.error.source);
			console.log(response.error.step);
			console.log(response.error.reason);
			console.log(response.error.metadata.order_id);
			console.log(response.error.metadata.payment_id);
		});

		razorpayPaymentInstance.open();
	}

	return error ? (
		<>Error: {error}</>
	) : (
		<>
			Payment Page Here
			<Script
				src="https://checkout.razorpay.com/v1/checkout.js"
				onLoad={initializePayment}
			/>
		</>
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

import Head from "next/head";
import {
	Container,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	Divider,
	Text,
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";

import db from "../../firebase/firestore";

import Error from "../../components/Layout/Error";
import UserTile from "../../components/Profile/UserTile";

const TransactionPage = ({
	transactionInfo,
	transactionId,
	userInfo,
	orderInfo,
	error,
}) => {
	return error || !transactionInfo ? (
		<Error
			errorMessage={
				error ||
				"Transaction Info could not be fetched. Please try again later."
			}
		/>
	) : (
		<Container maxWidth="450px" margin="0 auto" centerContent padding="2rem">
			<Head>
				<title>Smallet - Transaction</title>
			</Head>
			<Stat>
				<StatLabel fontSize="1.125rem">Amount</StatLabel>
				<StatNumber fontSize="3.5rem">
					{Number(transactionInfo.amount) < 0 ? "-" : ""}₹
					{Number(Math.abs(parseInt(transactionInfo.amount)) / 100).toFixed(2)}
				</StatNumber>
				<StatHelpText>
					<>
						<StatArrow
							type={
								Number(transactionInfo.amount) > 0 ? "increase" : "decrease"
							}
						/>{" "}
						Transaction ID: {transactionId}
						<br />
						<InfoIcon mr={2} />
						{orderInfo ? `Order ID: ${transactionInfo?.order}` : ""}
					</>
				</StatHelpText>
			</Stat>
			<Divider my={5} />
			<Text fontSize="xl" fontWeight={600} mb={3}>
				User Associated
			</Text>
			<UserTile
				user={userInfo}
				title={userInfo?.displayName}
				border="1px solid #cfcfcf"
			/>
		</Container>
	);
};

TransactionPage.getInitialProps = async (context) => {
	try {
		const { query } = context;

		if (!query.transactionId) return { error: "Invalid Transaction ID" };

		const transactionInfo = (
			await db.collection("wallettransactions").doc(query.transactionId).get()
		).data();

		if (!transactionInfo) return { error: "Transaction Not Found" };

		const userInfo = (
			await db.collection("users").doc(transactionInfo.user).get()
		).data();

		if (!userInfo) return { error: "Transaction User Not Found" };

		let orderInfo = null;
		if (transactionInfo.order) {
			orderInfo = (
				await db.collection("orders").doc(transactionInfo.order).get()
			).data();

			if (!orderInfo) return { error: "Payment Information Not Found" };
		}

		return {
			transactionId: query.transactionId,
			transactionInfo,
			userInfo,
			orderInfo,
		};
	} catch (err) {
		console.log(err);
		return { error: err.message };
	}
};

export default TransactionPage;

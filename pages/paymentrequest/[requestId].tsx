import { useState } from "react";
import Head from "next/head";
import {
	Container,
	Box,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	Button,
	Divider,
	Text,
	HStack,
} from "@chakra-ui/react";
import { IoCheckmarkDone } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { BsClockHistory } from "react-icons/bs";
import { MdClear } from "react-icons/md";

import db from "../../firebase/firestore";
import useStore from "../../hooks/useStore";

import Error from "../../components/Layout/Error";
import UserTile from "../../components/Profile/UserTile";
import { declinePaymentRequest } from "../../API/wallet";
import toasts from "../../utils/toasts";
import { TimeIcon } from "@chakra-ui/icons";

const PaymentRequestPage = ({
	paymentRequestInfo,
	paymentRequestId,
	fromUserInfo,
	toUserInfo,
	error,
}) => {
	const stateUser = useStore((state) => state.user);

	const [isLoading, setIsLoading] = useState(false);
	const [paymentRequestStatus, setPaymentRequestStatus] = useState(
		paymentRequestInfo.status || "pending"
	);

	const declineRequest = () => {
		if (!window.confirm("Are you sure? This is irreversible")) return;

		setIsLoading(true);
		declinePaymentRequest(paymentRequestId, (err) => {
			setIsLoading(false);
			if (err) return toasts.generateError(err);
			setPaymentRequestStatus("declined");
			return toasts.generateSuccess("Payment Request Declined Successfully");
		});
	};

	return error || !paymentRequestInfo ? (
		<Error
			errorMessage={
				error ||
				"Payment Request Info could not be fetched. Please try again later."
			}
		/>
	) : (
		<Container maxWidth="450px" margin="0 auto" centerContent padding="2rem">
			<Head>
				<title>Smallet - Payment Request</title>
			</Head>
			<Stat>
				<StatLabel fontSize="1.125rem">
					{paymentRequestInfo.title || "Amount"}
				</StatLabel>
				<StatNumber fontSize="3.5rem">
					<HStack>
						<>
							{Number(paymentRequestInfo.amount) < 0 ? "-" : ""}₹
							{Number(
								Math.abs(parseInt(paymentRequestInfo.amount)) / 100
							).toFixed(2)}
							<Box ml={3} title={paymentRequestInfo?.status}>
								{paymentRequestStatus === "paid" ? (
									<IoCheckmarkDone size="2.5rem" color="green" />
								) : paymentRequestStatus === "pending" ? (
									<BsClockHistory size="2.5rem" color="mustard" />
								) : (
									<MdClear size="2.5rem" color="red" />
								)}
							</Box>
						</>
					</HStack>
				</StatNumber>
				<StatHelpText>
					Request ID: {paymentRequestId}
					<br />
					<TimeIcon mr={2} />
					{new Date(paymentRequestInfo.createdAt).toDateString()}{" "}
					{new Date(paymentRequestInfo.createdAt).toTimeString().slice(0, 8)}
				</StatHelpText>
			</Stat>
			{stateUser?.uid === paymentRequestInfo?.toUser &&
			!["declined", "completed"].includes(paymentRequestStatus) ? (
				<HStack p={3} spacing={4}>
					<Button colorScheme="teal" variant="solid" isLoading={isLoading}>
						Pay
					</Button>
					<Button
						colorScheme="red"
						variant="ghost"
						onClick={declineRequest}
						isLoading={isLoading}
					>
						Decline
					</Button>
				</HStack>
			) : (
				""
			)}
			<Divider my={5} colorScheme="teal" />
			<Text
				fontSize="md"
				fontWeight={600}
				mb={3}
				display="flex"
				alignItems="center"
			>
				<FaUser style={{ display: "inline" }} /> &nbsp;Users Associated
			</Text>
			<Text my={5}>Requested By:</Text>
			<UserTile
				user={fromUserInfo}
				title={fromUserInfo?.displayName}
				border="1px solid #cfcfcf"
			/>
			<Text my={5}>Requested From:</Text>
			<UserTile
				user={toUserInfo}
				title={toUserInfo?.displayName}
				border="1px solid #cfcfcf"
			/>
		</Container>
	);
};

PaymentRequestPage.getInitialProps = async (context) => {
	try {
		const { query } = context;

		if (!query.requestId) return { error: "Invalid Payment Request ID" };

		const paymentRequestInfo = (
			await db.collection("paymentrequests").doc(query.requestId).get()
		).data();

		if (!paymentRequestInfo) return { error: "Payment Request Not Found" };
		paymentRequestInfo.updatedAt = paymentRequestInfo.updatedAt
			.toDate()
			.toISOString();
		paymentRequestInfo.createdAt = paymentRequestInfo.createdAt
			.toDate()
			.toISOString();

		const fromUserInfo = (
			await db.collection("users").doc(paymentRequestInfo.fromUser).get()
		).data();

		if (!fromUserInfo) return { error: "Request User Not Found" };

		const toUserInfo = (
			await db.collection("users").doc(paymentRequestInfo.toUser).get()
		).data();

		if (!toUserInfo) return { error: "Request User Not Found" };

		return {
			paymentRequestId: query.requestId,
			paymentRequestInfo,
			fromUserInfo,
			toUserInfo,
		};
	} catch (err) {
		console.log(err);
		return { error: err.message };
	}
};

export default PaymentRequestPage;

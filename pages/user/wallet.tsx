import {
	Container,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
} from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

import ContentWrapper from "../../components/Layout/ContentWrapper";
import FullPageLoader from "../../components/Layout/FullPageLoader";

import { getWalletRef } from "../../API";
import useStore from "../../hooks/useStore";
import setupProtectedRoute from "../../utils/setupProtectedRoute";

const Wallet = ({}) => {
	const user = useStore((state) => state.user);

	const [walletInfo, setWalletInfo] = useState(null);
	const walletRealtimeSubscriptionRef = useRef(() => null);

	const [transactions, setTransactions] = useState([]);
	const [transactionsStartAfter, setTransactionsStartAfter] = useState(null);

	useEffect(() => {
		walletRealtimeSubscriptionRef.current = getWalletRef(user?.uid).onSnapshot(
			(walletDoc) => setWalletInfo(walletDoc.data())
		);

		return () => {
			if (
				walletRealtimeSubscriptionRef.current &&
				typeof walletRealtimeSubscriptionRef.current === "function"
			)
				walletRealtimeSubscriptionRef.current();
		};
	}, []);

	return (
		<ContentWrapper>
			<Head>
				<title>
					Smallet - User Wallet{" "}
					{walletInfo?.balance
						? `(₹${Number(parseInt(walletInfo.balance) / 100).toFixed(1)})`
						: ""}
				</title>
			</Head>
			{!walletInfo ? (
				<FullPageLoader />
			) : (
				<Container maxWidth="container.xl" padding="1rem">
					<StatGroup>
						<Stat>
							<StatLabel fontSize="1.25rem">Wallet Balance</StatLabel>
							<StatNumber fontSize="2rem">
								₹{Number(parseInt(walletInfo.balance) / 100).toFixed(2)}
							</StatNumber>
							<StatHelpText fontSize="1.125rem">
								{walletInfo.lastTransaction ? (
									<>
										<StatArrow
											type={
												walletInfo.lastTransaction > 0 ? "increase" : "decrease"
											}
										/>
										₹
										{Number(parseInt(walletInfo.lastTransaction) / 100).toFixed(
											2
										)}
									</>
								) : (
									"Cleared"
								)}
							</StatHelpText>
						</Stat>
						<Stat>
							<StatLabel fontSize="1.125rem">Number Of Transactions</StatLabel>
							<StatNumber fontSize="1.875rem">
								{parseInt(walletInfo.nTransactions)}
							</StatNumber>
							<StatHelpText fontSize="1.125rem">
								<StatArrow type="increase" />
								{walletInfo.nSuccessfulTransactions || 0}
								&nbsp;&nbsp;
								<StatArrow type="decrease" />
								{walletInfo.nFailedTransactions || 0}
							</StatHelpText>
						</Stat>
					</StatGroup>
				</Container>
			)}
		</ContentWrapper>
	);
};

Wallet.getInitialProps = setupProtectedRoute();

export default Wallet;

import Head from "next/head";
import {
	Container,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
} from "@chakra-ui/react";
import { FaMoneyCheck } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

import ContentWrapper from "../../components/Layout/ContentWrapper";
import FullPageLoader from "../../components/Layout/FullPageLoader";

import { getWalletRef, getWalletTransactions } from "../../API";
import useStore from "../../hooks/useStore";
import setupProtectedRoute from "../../utils/setupProtectedRoute";
import toasts from "../../utils/toasts";
import NoneFound from "../../components/Layout/NoneFound";
import TransactionTile from "../../components/Wallet/TransactionTile";
import { Transaction } from "../../@types";

const Wallet = ({}) => {
	const user = useStore((state) => state.user);

	const [walletInfo, setWalletInfo] = useState(null);
	const walletRealtimeSubscriptionRef = useRef(() => null);

	const [transactions, setTransactions] = useState([]);
	const [transactionsStartAfter, setTransactionsStartAfter] = useState(null);
	const [loadMore, setLoadMore] = useState(false);

	useEffect(() => {
		if (user?.uid) {
			walletRealtimeSubscriptionRef.current = getWalletRef(
				user?.uid
			).onSnapshot((walletDoc) => setWalletInfo(walletDoc.data()));

			if (Number(user?.nTransactions)) {
				getWalletTransactions(
					user?.uid,
					transactionsStartAfter,
					(errorFetchingTransactions, transactionsRef) => {
						if (errorFetchingTransactions)
							return toasts.generateError(errorFetchingTransactions);
						setTransactions((transactions) => [
							...transactions,
							transactionsRef.docs.map((transaction) => ({
								...transaction.data(),
								id: transaction.id,
							})),
						]);
						setTransactionsStartAfter(
							transactionsRef.docs[transactionsRef.docs.length - 1]
						);
						if (
							transactions.length + transactionsRef.docs.length >=
							user?.nTransactions
						)
							setLoadMore(false);
					}
				);
			}

			return () => {
				if (
					walletRealtimeSubscriptionRef.current &&
					typeof walletRealtimeSubscriptionRef.current === "function"
				)
					walletRealtimeSubscriptionRef.current();
			};
		}
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
					<br />
					{transactions.length ? (
						transactions.map((transaction: Transaction) => (
							<TransactionTile key={transaction.id} transaction={transaction} />
						))
					) : (
						<NoneFound
							label="No Transactions To Show Yet"
							icon={() => <FaMoneyCheck size="5rem" color="gray" />}
						/>
					)}
				</Container>
			)}
		</ContentWrapper>
	);
};

Wallet.getInitialProps = setupProtectedRoute();

export default Wallet;

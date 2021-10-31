import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import styled from "@emotion/styled";
import {
	Container,
	Stat,
	StatLabel,
	Button,
	StatNumber,
	StatHelpText,
	StatArrow,
	StatGroup,
	Image,
	Center,
	HStack,
	Box,
	useDisclosure,
} from "@chakra-ui/react";
import { FaMoneyCheck } from "react-icons/fa";
import { GiPayMoney } from "react-icons/gi";
import { BiTransfer } from "react-icons/bi";

import { Transaction } from "../../@types";

import ContentWrapper from "../../components/Layout/ContentWrapper";
import FullPageLoader from "../../components/Layout/FullPageLoader";

import { getWalletRef, getWalletTransactions } from "../../API";
import useStore from "../../hooks/useStore";
import setupProtectedRoute from "../../utils/setupProtectedRoute";
import toasts from "../../utils/toasts";
import NoneFound from "../../components/Layout/NoneFound";
import TransactionTile from "../../components/Wallet/TransactionTile";
import AddMoneyTransactionModal from "../../components/Wallet/AddMoneyTranactionModal";

const TransactionsSection = styled(HStack)`
	align-items: flex-start;
	justify-content: flex-start;
	@media only screen and (max-width: 768px) {
		flex-direction: column;
	}
`;

const TransactionList = styled(Box)`
	min-width: 70%;
	@media only screen and (max-width: 768px) {
		min-width: 100%;
	}
`;

const TransactionListImageContainer = styled(Center)`
	padding: var(--standard-spacing);
	width: 30%;
	@media only screen and (max-width: 768px) {
		width: 100%;
	}
`;

const Wallet = ({}) => {
	const user = useStore((state) => state.user);

	const {
		isOpen: showAddMoneyToWalletModal,
		onOpen: openAddMoneyToWalletModal,
		onClose: closeAddMoneyToWalletModal,
	} = useDisclosure();

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
							...transactionsRef.docs.map((transaction) => ({
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
											color={
												walletInfo.lastTransaction > 0 ? "green.700" : "red.700"
											}
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
								<StatArrow type="increase" color="green.700" />
								{walletInfo.nSuccessfulTransactions || 0}
								&nbsp;&nbsp;
								<StatArrow type="decrease" color="red.700" />
								{walletInfo.nFailedTransactions || 0}
							</StatHelpText>
						</Stat>
					</StatGroup>
					<br />
					<TransactionsSection>
						<TransactionList minWidth="70%">
							{/* Add Money To Wallet and Money Transfer related */}
							<Box textAlign="right" width="100%">
								<HStack spacing={5} justifyContent="flex-end">
									<Button
										colorScheme="orange"
										variant="outline"
										onClick={() => window.alert("Coming Soon")}
										rightIcon={<BiTransfer size="1.25rem" />}
									>
										Transfer Money
									</Button>
									<Button
										colorScheme="green"
										variant="solid"
										onClick={openAddMoneyToWalletModal}
										leftIcon={<GiPayMoney size="1.25rem" />}
									>
										Add Money
									</Button>
								</HStack>
							</Box>
							<br />
							<AddMoneyTransactionModal
								isOpen={showAddMoneyToWalletModal}
								onClose={closeAddMoneyToWalletModal}
							/>
							{transactions.length ? (
								transactions.map((transaction: Transaction) => (
									<TransactionTile
										key={transaction.id}
										transaction={transaction}
									/>
								))
							) : (
								<NoneFound
									label="No Transactions To Show Yet"
									icon={() => <FaMoneyCheck size="5rem" color="gray" />}
								/>
							)}
						</TransactionList>
						<TransactionListImageContainer>
							<Image src="/purchase.svg" maxWidth="100%" />
						</TransactionListImageContainer>
					</TransactionsSection>
				</Container>
			)}
		</ContentWrapper>
	);
};

Wallet.getInitialProps = setupProtectedRoute();

export default Wallet;

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
	Tooltip,
	// For Modals
	useDisclosure,
} from "@chakra-ui/react";
import { FaMoneyCheck } from "react-icons/fa";
import { GiPayMoney } from "react-icons/gi";
import { BiTransfer } from "react-icons/bi";
import { MdFileUpload, MdRequestQuote } from "react-icons/md";
import { ChevronDownIcon } from "@chakra-ui/icons";

import { Transaction } from "../../@types";

import ContentWrapper from "../../components/Layout/ContentWrapper";
import FullPageLoader from "../../components/Layout/FullPageLoader";
import NoneFound from "../../components/Layout/NoneFound";
import TransactionTile from "../../components/Wallet/TransactionTile";

import AddMoneyTransactionModal from "../../components/Wallet/AddMoneyTranactionModal";
import TransferMoneyModal from "../../components/Wallet/TransferMoney";
import RequestMoneyModal from "../../components/Wallet/RequestMoneyModal";
import PaymentRequests from "../../components/Wallet/PaymentRequests";

import { getWalletRef } from "../../API";
import { getWalletTransactions } from "../../API/wallet";

import useStore from "../../hooks/useStore";
import setupProtectedRoute from "../../utils/setupProtectedRoute";
import toasts from "../../utils/toasts";

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

const WalletActionsStack = styled(HStack)`
	@media (max-width: 576px) {
		flex-direction: column;
		button {
			width: 100%;
			margin: 0;
			margin-inline-start: 0 !important;
			-webkit-margin-start: 0 !important;
		}
		button:not(:first-child) {
			margin-top: var(--standard-spacing);
		}
	}
`;

const Wallet = ({}) => {
	const user = useStore((state) => state.user);

	const {
		isOpen: showAddMoneyToWalletModal,
		onOpen: openAddMoneyToWalletModal,
		onClose: closeAddMoneyToWalletModal,
	} = useDisclosure();

	const {
		isOpen: showTransferMoneyToWalletModal,
		onOpen: openTransferMoneyToWalletModal,
		onClose: closeTransferMoneyToWalletModal,
	} = useDisclosure();

	const {
		isOpen: showRequestMoneyModal,
		onOpen: openRequestMoneyModal,
		onClose: closeRequestMoneyModal,
	} = useDisclosure();

	const {
		isOpen: showPaymentRequestsListModal,
		onOpen: openPaymentRequestsListModal,
		onClose: closePaymentRequestsListModal,
	} = useDisclosure();

	const [walletInfo, setWalletInfo] = useState(null);
	const walletRealtimeSubscriptionRef = useRef(() => null);
	const isFetchingTransactions = useRef(false);

	const [transactions, setTransactions] = useState([]);
	const [transactionsStartAfter, setTransactionsStartAfter] = useState(null);
	const [loadMore, setLoadMore] = useState(false);

	const fetchTransactions = () => {
		if (Number(user?.nTransactions) && !isFetchingTransactions.current) {
			isFetchingTransactions.current = true;
			getWalletTransactions(
				user?.uid,
				transactionsStartAfter,
				(errorFetchingTransactions, transactionsRef) => {
					isFetchingTransactions.current = false;
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
	};

	useEffect(() => {
		if (user?.uid) {
			walletRealtimeSubscriptionRef.current = getWalletRef(
				user?.uid
			).onSnapshot((walletDoc) => setWalletInfo(walletDoc.data()));

			fetchTransactions();

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
						? `(???${Number(parseInt(walletInfo.balance) / 100).toFixed(1)})`
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
								???{Number(parseInt(walletInfo.balance) / 100).toFixed(2)}
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
										???
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
							<StatLabel fontSize="1.125rem">Transactions</StatLabel>
							<StatNumber fontSize="1.875rem">
								{parseInt(walletInfo.nTransactions)}
							</StatNumber>
							<StatHelpText fontSize="1.125rem">
								<Tooltip label="Successful Transactions">
									<>
										<StatArrow type="increase" color="green.700" />
										{walletInfo.nSuccessfulTransactions || 0}
									</>
								</Tooltip>
								&nbsp;&nbsp;
								<Tooltip label="Failed Transactions">
									<>
										<StatArrow type="decrease" color="red.700" />
										{walletInfo.nFailedTransactions || 0}
									</>
								</Tooltip>
							</StatHelpText>
						</Stat>
					</StatGroup>
					<br />
					<TransactionsSection>
						<TransactionList minWidth="70%">
							{/* Add Money To Wallet and Money Transfer related */}
							<Box textAlign="right" width="100%">
								<WalletActionsStack spacing={2} justifyContent="flex-end">
									<Button
										colorScheme="cyan"
										variant="outline"
										onClick={openPaymentRequestsListModal}
										rightIcon={<MdFileUpload size="1.25rem" />}
									>
										Payment Requests
									</Button>
									<Button
										colorScheme="purple"
										variant="outline"
										onClick={openRequestMoneyModal}
										rightIcon={<MdRequestQuote size="1.25rem" />}
									>
										Request Money
									</Button>
									<Button
										colorScheme="orange"
										variant="outline"
										onClick={openTransferMoneyToWalletModal}
										rightIcon={<BiTransfer size="1.25rem" />}
									>
										Send Money
									</Button>
									<Button
										colorScheme="green"
										variant="solid"
										onClick={openAddMoneyToWalletModal}
										leftIcon={<GiPayMoney size="1.25rem" />}
									>
										Add Money
									</Button>
								</WalletActionsStack>
							</Box>
							<br />
							<AddMoneyTransactionModal
								isOpen={showAddMoneyToWalletModal}
								onClose={closeAddMoneyToWalletModal}
							/>
							<TransferMoneyModal
								isOpen={showTransferMoneyToWalletModal}
								onClose={closeTransferMoneyToWalletModal}
							/>
							<RequestMoneyModal
								isOpen={showRequestMoneyModal}
								onClose={closeRequestMoneyModal}
							/>
							<PaymentRequests
								isOpen={showPaymentRequestsListModal}
								onClose={closePaymentRequestsListModal}
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
							<br />
							{loadMore ? (
								<Center>
									<Button
										shadow="sm"
										variant="outline"
										colorScheme="teal"
										onClick={fetchTransactions}
										leftIcon={<ChevronDownIcon fontSize="1.5rem" />}
									>
										Load More
									</Button>
								</Center>
							) : (
								""
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

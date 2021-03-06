import Link from "next/link";
import { TimeIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Box, Stat, StatNumber, Tooltip, Text, VStack } from "@chakra-ui/react";
import { Transaction } from "../../@types";

import { IoCheckmarkDone } from "react-icons/io5";
import { MdClear } from "react-icons/md";
import { BsClockHistory } from "react-icons/bs";

interface TransactionTileProps {
	transaction: Transaction;
}

const TransactionTile = ({ transaction }: TransactionTileProps) => {
	const isPendingWalletAddMoneyTransaction =
		transaction?.status === "pending" &&
		transaction?.type === "wallet_topup" &&
		transaction?.order;
	const ContainerElement = isPendingWalletAddMoneyTransaction ? Tooltip : "div";

	return transaction ? (
		<ContainerElement
			label={
				isPendingWalletAddMoneyTransaction
					? "Click to proceed with pending transaction"
					: ""
			}
			aria-label={isPendingWalletAddMoneyTransaction ? "Tooltip" : ""}
		>
			<Link
				href={
					isPendingWalletAddMoneyTransaction
						? `/makeWalletPayment?orderId=${transaction.order}`
						: `/transaction/${transaction.id}`
				}
			>
				<a target="_blank" rel="noopener noreferrer">
					<Box
						p={5}
						mb={10}
						shadow="md"
						borderRadius="0.25rem"
						border={
							transaction.status === "paid"
								? "dashed green"
								: "1px solid #cfcfcf"
						}
					>
						<VStack>
							{transaction.title ? (
								<Box
									display="flex"
									justifyContent="flex-start"
									width="100%"
								>
									<Text color="gray">{transaction.title}</Text>
								</Box>
							) : (
								""
							)}
							<Box display="flex" alignItems="center" width="100%">
								<Box>
									{transaction.amount > 0 ? (
										<TriangleUpIcon color="green.600" />
									) : (
										<TriangleDownIcon color="red.600" />
									)}
								</Box>
								<Stat flex="5" minWidth="50%">
									<StatNumber ml={5}>
										₹ {Number(transaction.amount / 100).toFixed(2)}
									</StatNumber>
								</Stat>
								<Box
									flex="4"
									minWidth="40%"
									display="flex"
									justifyContent="flex-end"
								>
									{transaction.status === "paid" ? (
										<IoCheckmarkDone size="1.5rem" color="green" />
									) : transaction.status === "pending" ? (
										<BsClockHistory size="1.5rem" color="gray" />
									) : (
										<MdClear size="1.5rem" color="gray" />
									)}
								</Box>
							</Box>
							<Box width="100%">
								<Text fontSize="sm" color="gray">
									<TimeIcon />{" "}
									{transaction?.createdAt?.toDate?.()?.toDateString?.()}{" "}
									{transaction?.createdAt
										?.toDate?.()
										?.toTimeString?.()
										.slice(0, 8)}
								</Text>
							</Box>
						</VStack>
					</Box>
				</a>
			</Link>
		</ContainerElement>
	) : (
		<></>
	);
};

export default TransactionTile;

import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Input, Textarea } from "@chakra-ui/react";
import { MdSend } from "react-icons/md";

import { createAddMoneyToWalletTransaction } from "../../API/wallet";

import ReusableModal from "../Modal";
import toasts from "../../utils/toasts";

const AddMoneyTransactionModal = ({ isOpen, onClose }) => {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);

	const [transactionTitle, setTransactionTitle] = useState("");
	const [transactionDescription, setTransactionDescription] = useState("");
	const [amountToAdd, setAmountToAdd]: [string | number, (any) => any] =
		useState("");

	const startAddMoneyTransactionProcess = () => {
		if (!amountToAdd) return;

		setIsLoading(true);
		createAddMoneyToWalletTransaction(
			{
				amount: Number(amountToAdd) * 100, // Paise for backend to process
				title: transactionTitle,
				description: transactionDescription,
			},
			(error, response) => {
				setIsLoading(false);
				if (error) return toasts.generateError(error);
				if (response?.order?.id)
					return window.location.replace(
						`/makeWalletPayment?orderId=${response.order.id}`
					);
				else
					return toasts.generateError(
						"Something went wrong, please try again later."
					);
			}
		);
	};

	return (
		<ReusableModal
			title="Add Money To Wallet"
			isOpen={isOpen}
			onClose={onClose}
			actionButton={
				<Button
					colorScheme="teal"
					variant="solid"
					isLoading={isLoading}
					rightIcon={<MdSend size="1.25rem" />}
					onClick={startAddMoneyTransactionProcess}
				>
					Add Money
				</Button>
			}
		>
			<Input
				type="number"
				placeholder="Amount To Add in ₹ (Ex: 1500)"
				step={0.01}
				onChange={(e) => {
					e.persist();
					setAmountToAdd(Number(e.target.value) || "");
				}}
				borderColor="teal.500"
				borderWidth={2}
				mb={3}
				required
				isRequired
			/>
			<Input
				type="text"
				placeholder="Transaction Title, Ex: Add money for October"
				onChange={(e) => {
					e.persist();
					setTransactionTitle(e.target.value);
				}}
				value={transactionTitle}
				mb={3}
			/>
			<Textarea
				value={transactionDescription}
				onChange={(e) => {
					e.persist();
					setTransactionDescription(e.target.value);
				}}
				placeholder="Some description (Optional)"
				size="sm"
				borderRadius="0.375rem"
			/>
		</ReusableModal>
	);
};

export default AddMoneyTransactionModal;

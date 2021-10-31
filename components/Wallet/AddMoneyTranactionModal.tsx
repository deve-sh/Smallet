import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Input } from "@chakra-ui/react";
import { MdSend } from "react-icons/md";

import { createAddMoneyToWalletTransaction } from "../../API/wallet";

import ReusableModal from "../Modal";
import toasts from "../../utils/toasts";

const AddMoneyTransactionModal = ({ isOpen, onClose }) => {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [amountToAdd, setAmountToAdd]: [string | number, (any) => any] =
		useState("");

	const startAddMoneyTransactionProcess = () => {
		if (!amountToAdd) return;

		setIsLoading(true);
		createAddMoneyToWalletTransaction(
			Number(amountToAdd) * 100, // Paise for backend to process
			(error, response) => {
				setIsLoading(false);
				if (error) return toasts.generateError(error);
				if (response?.order?.id)
					return router.push(`/makeWalletPayment?orderId=${response.order.id}`);
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
				required
			/>
		</ReusableModal>
	);
};

export default AddMoneyTransactionModal;
